/**
 * POST /api/gate/exit
 * Leave the library and free up a slot
 */
import { NextRequest, NextResponse } from "next/server";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce, hashIP, getClientIP } from "@/lib/gate/hashing";
import { exitSession, promoteFromQueue } from "@/lib/gate/queue";
import { getGateStatus, getQueueLength } from "@/lib/gate/occupancy";
import { broadcastOccupancy, notifyPromoted } from "@/lib/ws/broadcast";
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

    // Mark session as exited
    await exitSession(tokenHash);

    // Promote from queue to fill the slot
    const promotedTokenHashes = await promoteFromQueue();

    // Get updated gate status
    const gateStatus = await getGateStatus();
    const queueLength = await getQueueLength();

    // Broadcast occupancy update and notify promoted sessions
    broadcastOccupancy(gateStatus.activeCount, config.gate.capacity, queueLength);
    if (promotedTokenHashes.length > 0) {
      notifyPromoted(promotedTokenHashes);
    }

    // Clear cookie
    const response = NextResponse.json({ status: "EXITED" });
    response.cookies.delete("gate_pass");

    return response;
  } catch (error) {
    console.error("Exit error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "server_error" },
      { status: 500 }
    );
  }
}
