/**
 * Gate queue management with FIFO promotion
 */
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { getActiveCount } from "./occupancy";

/**
 * Mark stale sessions as expired
 * Called during heartbeat and check-in to clean up
 */
export async function expireStaleSession(): Promise<number> {
  const cutoff = new Date(Date.now() - config.gate.heartbeatWindowMs);
  
  const result = await prisma.gateSession.updateMany({
    where: {
      status: "ACTIVE",
      lastSeenAt: { lt: cutoff },
    },
    data: {
      status: "EXPIRED",
    },
  });
  
  return result.count;
}

/**
 * Promote queued sessions to active when slots open
 * Uses FIFO ordering by queuedAt
 * Returns array of promoted session IDs for WebSocket notification
 */
export async function promoteFromQueue(): Promise<string[]> {
  // First, expire stale sessions
  await expireStaleSession();
  
  // Check available capacity
  const activeCount = await getActiveCount();
  const availableSlots = config.gate.capacity - activeCount;
  
  if (availableSlots <= 0) {
    return [];
  }
  
  // Get next sessions to promote (FIFO by queuedAt)
  const toPromote = await prisma.gateSession.findMany({
    where: { status: "QUEUED" },
    orderBy: { queuedAt: "asc" },
    take: availableSlots,
    select: { id: true, tokenHash: true },
  });
  
  if (toPromote.length === 0) {
    return [];
  }
  
  const now = new Date();
  const promotedIds: string[] = [];
  
  // Promote each session (SQLite doesn't support FOR UPDATE, so we do individual updates)
  for (const session of toPromote) {
    await prisma.gateSession.update({
      where: { id: session.id },
      data: {
        status: "ACTIVE",
        enteredAt: now,
        lastSeenAt: now,
      },
    });
    promotedIds.push(session.tokenHash);
  }
  
  return promotedIds;
}

/**
 * Add a session to the queue
 */
export async function enqueueSession(sessionId: string): Promise<void> {
  await prisma.gateSession.update({
    where: { id: sessionId },
    data: {
      status: "QUEUED",
      queuedAt: new Date(),
    },
  });
}

/**
 * Get session by token hash
 */
export async function getSessionByTokenHash(tokenHash: string) {
  return prisma.gateSession.findUnique({
    where: { tokenHash },
  });
}

/**
 * Update session last seen time (heartbeat)
 */
export async function updateLastSeen(tokenHash: string): Promise<boolean> {
  try {
    await prisma.gateSession.update({
      where: { tokenHash },
      data: { lastSeenAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Mark session as exited
 */
export async function exitSession(tokenHash: string): Promise<boolean> {
  try {
    await prisma.gateSession.update({
      where: { tokenHash },
      data: { status: "EXITED" },
    });
    return true;
  } catch {
    return false;
  }
}
