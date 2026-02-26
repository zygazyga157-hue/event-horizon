/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed solution
 */
import { config } from "@/lib/config";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if request is rate limited
 * Returns remaining requests or -1 if limited
 */
export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);
  
  // Clean expired entries periodically
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      if (v.resetAt < now) store.delete(k);
    }
  }
  
  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, {
      count: 1,
      resetAt: now + config.gate.rateLimitWindowMs,
    });
    return {
      allowed: true,
      remaining: config.gate.rateLimitMaxRequests - 1,
      resetIn: config.gate.rateLimitWindowMs,
    };
  }
  
  if (entry.count >= config.gate.rateLimitMaxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: config.gate.rateLimitMaxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Get rate limit key from IP
 */
export function getRateLimitKey(ip: string): string {
  return `gate:checkin:${ip}`;
}
