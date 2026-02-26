/**
 * Session Cleanup Worker
 * 
 * Periodically cleans up expired gate sessions.
 * Uses Prisma for database operations.
 */

import { prisma } from "@/lib/prisma";

// Configuration
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes
const SESSION_EXPIRY_MS = parseInt(process.env.GATE_HEARTBEAT_WINDOW_MS || "90000"); // 90 seconds default
const EXITED_RETENTION_HOURS = 24; // Keep exited sessions for 24 hours

/**
 * Clean up stale sessions
 * 
 * - ACTIVE/QUEUED sessions not seen within heartbeat window → EXPIRED
 * - Old EXPIRED/EXITED sessions → deleted
 */
async function cleanupSessions(): Promise<{
  expired: number;
  deleted: number;
}> {
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() - SESSION_EXPIRY_MS);
  const deletionThreshold = new Date(now.getTime() - EXITED_RETENTION_HOURS * 60 * 60 * 1000);

  // Expire stale active/queued sessions
  const expireResult = await prisma.gateSession.updateMany({
    where: {
      status: { in: ["ACTIVE", "QUEUED"] },
      lastSeenAt: { lt: expiryThreshold },
    },
    data: {
      status: "EXPIRED",
    },
  });

  // Delete old expired/exited sessions
  const deleteResult = await prisma.gateSession.deleteMany({
    where: {
      status: { in: ["EXPIRED", "EXITED"] },
      lastSeenAt: { lt: deletionThreshold },
    },
  });

  return {
    expired: expireResult.count,
    deleted: deleteResult.count,
  };
}

/**
 * Clean up expired admin passkeys
 */
async function cleanupPasskeys(): Promise<number> {
  const now = new Date();

  const result = await prisma.adminPasskey.deleteMany({
    where: {
      OR: [
        // Expired and unused
        { expiresAt: { lt: now }, usedAt: null },
        // Used more than 1 hour ago
        { usedAt: { lt: new Date(now.getTime() - 60 * 60 * 1000) } },
      ],
    },
  });

  return result.count;
}

/**
 * Main worker loop
 */
export async function runCleanupWorker(): Promise<never> {
  console.log("[Cleanup] Worker started");

  while (true) {
    try {
      const sessionStats = await cleanupSessions();
      const passkeysDeleted = await cleanupPasskeys();

      if (sessionStats.expired > 0 || sessionStats.deleted > 0 || passkeysDeleted > 0) {
        console.log(
          `[Cleanup] Sessions: ${sessionStats.expired} expired, ${sessionStats.deleted} deleted | ` +
          `Passkeys: ${passkeysDeleted} deleted`
        );
      }
    } catch (error) {
      console.error("[Cleanup] Worker error:", error);
    }

    // Wait before next cleanup cycle
    await new Promise((resolve) => setTimeout(resolve, CLEANUP_INTERVAL_MS));
  }
}

/**
 * Get session statistics
 */
export async function getSessionStats(): Promise<{
  active: number;
  queued: number;
  expired: number;
  exited: number;
  total: number;
}> {
  const [active, queued, expired, exited] = await Promise.all([
    prisma.gateSession.count({ where: { status: "ACTIVE" } }),
    prisma.gateSession.count({ where: { status: "QUEUED" } }),
    prisma.gateSession.count({ where: { status: "EXPIRED" } }),
    prisma.gateSession.count({ where: { status: "EXITED" } }),
  ]);

  return {
    active,
    queued,
    expired,
    exited,
    total: active + queued + expired + exited,
  };
}

/**
 * Force cleanup (for manual invocation)
 */
export async function forceCleanup(): Promise<{
  sessions: { expired: number; deleted: number };
  passkeys: number;
}> {
  const sessions = await cleanupSessions();
  const passkeys = await cleanupPasskeys();
  return { sessions, passkeys };
}
