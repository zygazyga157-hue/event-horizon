/**
 * Gate occupancy calculations
 */
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

/**
 * Get current active session count (within heartbeat window)
 */
export async function getActiveCount(): Promise<number> {
  const cutoff = new Date(Date.now() - config.gate.heartbeatWindowMs);
  
  const count = await prisma.gateSession.count({
    where: {
      status: "ACTIVE",
      lastSeenAt: { gte: cutoff },
    },
  });
  
  return count;
}

/**
 * Get current queue length
 */
export async function getQueueLength(): Promise<number> {
  const count = await prisma.gateSession.count({
    where: {
      status: "QUEUED",
    },
  });
  
  return count;
}

/**
 * Get queue position for a specific session
 */
export async function getQueuePosition(sessionId: string): Promise<number | null> {
  const session = await prisma.gateSession.findUnique({
    where: { id: sessionId },
    select: { status: true, queuedAt: true },
  });
  
  if (!session || session.status !== "QUEUED" || !session.queuedAt) {
    return null;
  }
  
  const position = await prisma.gateSession.count({
    where: {
      status: "QUEUED",
      queuedAt: { lt: session.queuedAt },
    },
  });
  
  return position + 1; // 1-indexed
}

/**
 * Get full gate status
 */
export async function getGateStatus() {
  const [activeCount, queueLength] = await Promise.all([
    getActiveCount(),
    getQueueLength(),
  ]);
  
  return {
    capacity: config.gate.capacity,
    activeCount,
    queueLength,
    isFull: activeCount >= config.gate.capacity,
  };
}

/**
 * Check if there's room for a new active session
 */
export async function hasCapacity(): Promise<boolean> {
  const activeCount = await getActiveCount();
  return activeCount < config.gate.capacity;
}
