/**
 * Environment configuration
 */

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  // Iron token signing
  ironSecret: () => getEnvVar("IRON_SECRET", "dev-secret-must-be-at-least-32-characters-long"),
  
  // Gate settings
  gate: {
    capacity: 200,
    heartbeatWindowMs: 90 * 1000, // 90 seconds
    heartbeatIntervalMs: 20 * 1000, // 20 seconds
    tokenTtlMs: 2 * 60 * 60 * 1000, // 2 hours
    rateLimitWindowMs: 5 * 60 * 1000, // 5 minutes
    rateLimitMaxRequests: 5,
  },

  // WebSocket settings
  ws: {
    pingIntervalMs: 30 * 1000,
    pongTimeoutMs: 10 * 1000,
  },

  // Database
  databaseUrl: () => getEnvVar("DATABASE_URL", "file:./dev.db"),

  // Runtime checks
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
} as const;
