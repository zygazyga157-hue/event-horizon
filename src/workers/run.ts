#!/usr/bin/env npx tsx
/**
 * Worker Runner
 * 
 * Runs background workers for the Event Horizon Gallery.
 * 
 * Usage:
 *   npx tsx src/workers/run.ts                 # Run all workers
 *   npx tsx src/workers/run.ts outbox          # Run only outbox worker
 *   npx tsx src/workers/run.ts cleanup         # Run only cleanup worker
 */

import { runOutboxWorker } from "@/lib/workers/outbox";
import { runCleanupWorker } from "@/lib/workers/cleanup";

const WORKERS = {
  outbox: runOutboxWorker,
  cleanup: runCleanupWorker,
};

async function main() {
  const args = process.argv.slice(2);
  const workerName = args[0];

  console.log("╔════════════════════════════════════════════╗");
  console.log("║  EVENT HORIZON — Background Workers        ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log();

  if (workerName && workerName in WORKERS) {
    // Run specific worker
    console.log(`Starting ${workerName} worker...`);
    await WORKERS[workerName as keyof typeof WORKERS]();
  } else if (workerName) {
    // Unknown worker
    console.error(`Unknown worker: ${workerName}`);
    console.log(`Available workers: ${Object.keys(WORKERS).join(", ")}`);
    process.exit(1);
  } else {
    // Run all workers concurrently
    console.log("Starting all workers...");
    console.log();
    
    await Promise.all([
      runOutboxWorker(),
      runCleanupWorker(),
    ]);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[Workers] Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[Workers] Shutting down...");
  process.exit(0);
});

main().catch((error) => {
  console.error("[Workers] Fatal error:", error);
  process.exit(1);
});
