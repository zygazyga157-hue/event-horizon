/**
 * GET /api/gate/status
 * Get current gate occupancy and optionally session status
 */
import { NextRequest, NextResponse } from "next/server";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce, hashIP, getClientIP } from "@/lib/gate/hashing";
import { getGateStatus, getQueuePosition } from "@/lib/gate/occupancy";
import { getSessionByTokenHash, promoteFromQueue } from "@/lib/gate/queue";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
  try {
    // Run promotion logic
    await promoteFromQueue();

    // Get current gate status
    const gateStatus = await getGateStatus();

    // Check if user has a token
    const token = request.cookies.get("gate_pass")?.value;

    if (!token) {
      return NextResponse.json({
        capacity: config.gate.capacity,
        activeCount: gateStatus.activeCount,
        queueLength: gateStatus.queueLength,
      });
    }

    // Verify token
    const payload = await unsealToken(token);

    if (!payload) {
      return NextResponse.json({
        capacity: config.gate.capacity,
        activeCount: gateStatus.activeCount,
        queueLength: gateStatus.queueLength,
      });
    }

    // Verify IP matches
    const clientIP = getClientIP(request.headers);
    const ipHash = hashIP(clientIP);

    if (payload.ipHash !== ipHash) {
      return NextResponse.json({
        capacity: config.gate.capacity,
        activeCount: gateStatus.activeCount,
        queueLength: gateStatus.queueLength,
      });
    }

    const tokenHash = hashNonce(payload.nonce);
    const session = await getSessionByTokenHash(tokenHash);

    if (!session) {
      return NextResponse.json({
        capacity: config.gate.capacity,
        activeCount: gateStatus.activeCount,
        queueLength: gateStatus.queueLength,
      });
    }

    let queuePosition: number | undefined;
    if (session.status === "QUEUED") {
      queuePosition = (await getQueuePosition(session.id)) ?? undefined;
    }

    return NextResponse.json({
      capacity: config.gate.capacity,
      activeCount: gateStatus.activeCount,
      queueLength: gateStatus.queueLength,
      yourStatus: session.status,
      queuePosition,
      isAdmin: session.isAdmin || false,
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
