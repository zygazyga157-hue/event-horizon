/**
 * POST /api/gate/verify-passkey
 * Verify admin passkey and grant admin session
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyPasskey, isPasskeyExpired } from "@/lib/auth/passkey";
import { createToken } from "@/lib/auth/iron";
import { hashNonce, hashIP, getClientIP } from "@/lib/gate/hashing";
import { getGateStatus } from "@/lib/gate/occupancy";
import { broadcastOccupancy } from "@/lib/ws/broadcast";
import { config } from "@/lib/config";

const verifySchema = z.object({
  email: z.string().email(),
  passkey: z.string().length(8),
});

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers);
    const ipHash = hashIP(clientIP);

    // Parse and validate body
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          code: "validation_error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, passkey } = parsed.data;

    // Find the most recent unused passkey for this email
    const storedPasskey = await prisma.adminPasskey.findFirst({
      where: {
        email: email.toLowerCase(),
        usedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!storedPasskey) {
      return NextResponse.json(
        { error: "Invalid or expired passkey", code: "passkey_invalid" },
        { status: 401 }
      );
    }

    // Check if expired
    if (isPasskeyExpired(storedPasskey.expiresAt)) {
      return NextResponse.json(
        { error: "Passkey has expired", code: "passkey_expired" },
        { status: 401 }
      );
    }

    // Verify passkey
    if (!verifyPasskey(passkey, storedPasskey.passkeyHash)) {
      return NextResponse.json(
        { error: "Invalid passkey", code: "passkey_invalid" },
        { status: 401 }
      );
    }

    // Mark passkey as used
    await prisma.adminPasskey.update({
      where: { id: storedPasskey.id },
      data: { usedAt: new Date() },
    });

    // Create admin session
    const now = new Date();
    const { token, nonce } = await createToken(ipHash);
    const tokenHash = hashNonce(nonce);

    const session = await prisma.gateSession.create({
      data: {
        displayName: "Zyga",
        email: email.toLowerCase(),
        purpose: "client",
        status: "ACTIVE",
        tokenHash,
        ipHash,
        isAdmin: true,
        enteredAt: now,
        lastSeenAt: now,
      },
    });

    // Log admin access
    await prisma.auditLog.create({
      data: {
        sessionId: session.id,
        action: "ADMIN_LOGIN",
        entityType: "SESSION",
        entityId: session.id,
        details: JSON.stringify({ email, ipHash }),
      },
    });

    // Get current gate status
    const gateStatus = await getGateStatus();

    // Broadcast occupancy update
    broadcastOccupancy(
      gateStatus.activeCount,
      config.gate.capacity,
      gateStatus.queueLength
    );

    // Set cookie and return success
    const response = NextResponse.json({
      status: "ACTIVE",
      isAdmin: true,
      passToken: token,
      capacity: config.gate.capacity,
      activeCount: gateStatus.activeCount,
      queueLength: gateStatus.queueLength,
    });

    response.cookies.set("gate_pass", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: config.gate.tokenTtlMs / 1000,
    });

    return response;
  } catch (error) {
    console.error("Passkey verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
