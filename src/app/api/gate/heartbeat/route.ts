/**
 * POST /api/gate/heartbeat
 * Keep session alive and check for promotion
 */
import { NextRequest, NextResponse } from "next/server";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce, hashIP, getClientIP } from "@/lib/gate/hashing";
import { getGateStatus, getQueuePosition, getQueueLength } from "@/lib/gate/occupancy";
import { updateLastSeen, getSessionByTokenHash, promoteFromQueue } from "@/lib/gate/queue";
import { broadcastOccupancy } from "@/lib/ws/broadcast";
import { config } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("gate_pass")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No pass token", code: "token_missing" },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await unsealToken(token);

    if (!payload) {
      const response = NextResponse.json(
        { error: "Invalid or expired token", code: "token_invalid" },
        { status: 401 }
      );
      response.cookies.delete("gate_pass");
      return response;
    }

    // Verify IP matches
    const clientIP = getClientIP(request.headers);
    const ipHash = hashIP(clientIP);

    if (payload.ipHash !== ipHash) {
      const response = NextResponse.json(
        { error: "Token IP mismatch", code: "token_invalid" },
        { status: 401 }
      );
      response.cookies.delete("gate_pass");
      return response;
    }

    const tokenHash = hashNonce(payload.nonce);

    // Get session
    const session = await getSessionByTokenHash(tokenHash);

    if (!session) {
      const response = NextResponse.json(
        { error: "Session not found", code: "session_not_found" },
        { status: 401 }
      );
      response.cookies.delete("gate_pass");
      return response;
    }

    // Check if expired or exited
    if (session.status === "EXPIRED" || session.status === "EXITED") {
      const response = NextResponse.json(
        { error: "Session expired", code: "session_expired", status: session.status },
        { status: 410 }
      );
      response.cookies.delete("gate_pass");
      return response;
    }

    // Update last seen
    await updateLastSeen(tokenHash);

    // Run promotion logic
    await promoteFromQueue();

    // Re-fetch session to get current status (might have been promoted)
    const updatedSession = await getSessionByTokenHash(tokenHash);
    const gateStatus = await getGateStatus();
    const queueLength = await getQueueLength();

    // Broadcast occupancy update
    broadcastOccupancy(gateStatus.activeCount, config.gate.capacity, queueLength);

    let queuePosition: number | undefined;
    if (updatedSession?.status === "QUEUED") {
      queuePosition = (await getQueuePosition(updatedSession.id)) ?? undefined;
    }

    return NextResponse.json({
      status: updatedSession?.status ?? session.status,
      capacity: config.gate.capacity,
      activeCount: gateStatus.activeCount,
      queuePosition,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
