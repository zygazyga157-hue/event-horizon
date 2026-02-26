/**
 * WebSocket broadcast utilities for API routes
 * Uses global wsHub when running with custom server
 */

interface WSHub {
  broadcastOccupancy: (activeCount: number, capacity: number, queueLength: number) => void;
  notifyPromoted: (tokenHashes: string[]) => void;
  getConnectionCount: () => number;
}

/**
 * Get WebSocket hub if available (custom server mode)
 */
function getWSHub(): WSHub | null {
  if (typeof globalThis !== "undefined" && "wsHub" in globalThis) {
    return (globalThis as unknown as { wsHub: WSHub }).wsHub;
  }
  return null;
}

/**
 * Broadcast occupancy update to all connected clients
 */
export function broadcastOccupancy(
  activeCount: number,
  capacity: number,
  queueLength: number
): void {
  const hub = getWSHub();
  if (hub) {
    hub.broadcastOccupancy(activeCount, capacity, queueLength);
  }
}

/**
 * Notify specific sessions that they've been promoted
 */
export function notifyPromoted(tokenHashes: string[]): void {
  const hub = getWSHub();
  if (hub && tokenHashes.length > 0) {
    hub.notifyPromoted(tokenHashes);
  }
}

/**
 * Check if WebSocket server is available
 */
export function isWSAvailable(): boolean {
  return getWSHub() !== null;
}

/**
 * Get current WebSocket connection count
 */
export function getWSConnectionCount(): number {
  const hub = getWSHub();
  return hub?.getConnectionCount() ?? 0;
}
