/**
 * POST /api/gate/checkin
 * Sign the ledger to enter the library
 * If admin credentials detected, triggers passkey flow
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkinSchema } from "@/lib/validation";
import { createToken } from "@/lib/auth/iron";
import { hashNonce, hashIP, getClientIP } from "@/lib/gate/hashing";
import { getGateStatus, hasCapacity, getQueuePosition } from "@/lib/gate/occupancy";
import { promoteFromQueue } from "@/lib/gate/queue";
import { checkRateLimit, getRateLimitKey } from "@/lib/gate/rateLimit";
import { broadcastOccupancy } from "@/lib/ws/broadcast";
import { checkAdminCredentials } from "@/lib/gate/admin";
import { generatePasskey, hashPasskey, getPasskeyExpiry } from "@/lib/auth/passkey";
import { sendAdminPasskeyEmail } from "@/lib/email/smtp";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = getClientIP(request.headers);
    const ipHash = hashIP(clientIP);

    // Rate limiting
    const rateLimitKey = getRateLimitKey(clientIP);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "rate_limited",
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
          },
        }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = checkinSchema.safeParse(body);

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

    const { displayName, email, purpose, honeypot } = parsed.data;

    // Honeypot check
    if (honeypot && honeypot.length > 0) {
      // Silently reject bots (pretend success)
      return NextResponse.json(
        { status: "ACTIVE", passToken: "", capacity: 200, activeCount: 0 },
        { status: 200 }
      );
    }

    // Check if this is an admin sign-in attempt
    const adminCheck = checkAdminCredentials(displayName, email, purpose);
    
    if (adminCheck.isAdmin && adminCheck.email) {
      // Generate passkey and store it
      const passkey = generatePasskey();
      const passkeyHash = hashPasskey(passkey);
      const expiresAt = getPasskeyExpiry();
      
      // Store passkey in database
      await prisma.adminPasskey.create({
        data: {
          email: adminCheck.email,
          passkeyHash,
          expiresAt,
        },
      });
      
      // Send passkey email
      const emailSent = await sendAdminPasskeyEmail(adminCheck.email, passkey);
      
      if (!emailSent) {
        console.error('[Admin Auth] Failed to send passkey email');
        // Continue anyway - user can request new passkey
      }
      
      // Return special response indicating passkey required
      return NextResponse.json({
        status: "ADMIN_PASSKEY_REQUIRED",
        message: "Passkey sent to your email",
        email: adminCheck.email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email
      });
    }

    // Expire stale sessions and promote from queue
    await promoteFromQueue();

    // Check capacity
    const canEnter = await hasCapacity();
    const status = canEnter ? "ACTIVE" : "QUEUED";
    const now = new Date();

    // Create token
    const { token, nonce } = await createToken(ipHash);
    const tokenHash = hashNonce(nonce);

    // Create session
    const session = await prisma.gateSession.create({
      data: {
        displayName,
        email: email || null,
        purpose: purpose || null,
        status,
        tokenHash,
        ipHash,
        enteredAt: canEnter ? now : null,
        queuedAt: canEnter ? null : now,
        lastSeenAt: now,
      },
    });

    // Get current gate status
    const gateStatus = await getGateStatus();
    const queuePosition = !canEnter ? await getQueuePosition(session.id) : undefined;

    // Broadcast occupancy update via WebSocket
    broadcastOccupancy(
      gateStatus.activeCount,
      config.gate.capacity,
      gateStatus.queueLength
    );

    // Set cookie
    const response = NextResponse.json({
      status,
      passToken: token,
      capacity: config.gate.capacity,
      activeCount: gateStatus.activeCount,
      queueLength: gateStatus.queueLength,
      queuePosition,
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
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
