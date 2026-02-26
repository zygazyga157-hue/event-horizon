/**
 * Hashing utilities for tokens and IPs
 */
import { createHash } from "crypto";

/**
 * Create SHA-256 hash of a string
 */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Hash an IP address for storage (privacy-preserving)
 */
export function hashIP(ip: string, salt?: string): string {
  const data = salt ? `${ip}:${salt}` : ip;
  return sha256(data);
}

/**
 * Hash a token nonce for database lookup
 */
export function hashNonce(nonce: string): string {
  return sha256(nonce);
}

/**
 * Extract client IP from request headers
 * Handles various proxy headers
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback for local development
  return "127.0.0.1";
}
