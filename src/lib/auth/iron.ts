/**
 * Iron-sealed token utilities for Edge-compatible auth
 */
import Iron from "@hapi/iron";
import { config } from "@/lib/config";

export interface TokenPayload {
  nonce: string;
  iat: number;
  exp: number;
  ipHash: string;
}

const TOKEN_OPTIONS: Iron.SealOptions = {
  encryption: {
    saltBits: 256,
    algorithm: "aes-256-cbc",
    iterations: 1,
    minPasswordlength: 32,
  },
  integrity: {
    saltBits: 256,
    algorithm: "sha256",
    iterations: 1,
    minPasswordlength: 32,
  },
  ttl: config.gate.tokenTtlMs,
  timestampSkewSec: 60,
  localtimeOffsetMsec: 0,
};

/**
 * Seal a token payload into an encrypted string
 */
export async function sealToken(payload: TokenPayload): Promise<string> {
  const secret = config.ironSecret();
  return Iron.seal(payload, secret, TOKEN_OPTIONS);
}

/**
 * Unseal a token string back to payload
 * Returns null if invalid or expired
 */
export async function unsealToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = config.ironSecret();
    const payload = await Iron.unseal(token, secret, TOKEN_OPTIONS);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Create a new token with fresh nonce and timestamps
 */
export async function createToken(ipHash: string): Promise<{ token: string; nonce: string }> {
  const { nanoid } = await import("nanoid");
  const nonce = nanoid(21);
  const now = Date.now();
  
  const payload: TokenPayload = {
    nonce,
    iat: now,
    exp: now + config.gate.tokenTtlMs,
    ipHash,
  };
  
  const token = await sealToken(payload);
  return { token, nonce };
}

/**
 * Verify a token and extract payload
 * Returns null if invalid, expired, or IP mismatch
 */
export async function verifyToken(
  token: string,
  currentIpHash: string
): Promise<TokenPayload | null> {
  const payload = await unsealToken(token);
  
  if (!payload) return null;
  if (payload.exp < Date.now()) return null;
  if (payload.ipHash !== currentIpHash) return null;
  
  return payload;
}
