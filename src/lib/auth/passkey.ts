/**
 * Admin Passkey Utilities
 * 
 * 8-character alphanumeric passkey generation, hashing, and verification
 * for admin authentication flow.
 */

import { createHash, randomBytes } from 'crypto';

// Characters that are unambiguous (no 0/O, 1/l/I confusion)
const PASSKEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PASSKEY_LENGTH = 8;
const PASSKEY_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generate a random 8-character alphanumeric passkey
 * Uses unambiguous characters to avoid confusion
 */
export function generatePasskey(): string {
  const bytes = randomBytes(PASSKEY_LENGTH);
  let passkey = '';
  
  for (let i = 0; i < PASSKEY_LENGTH; i++) {
    const index = bytes[i] % PASSKEY_CHARS.length;
    passkey += PASSKEY_CHARS[index];
  }
  
  return passkey;
}

/**
 * Hash a passkey for secure storage
 * Uses SHA-256 for fast verification
 */
export function hashPasskey(passkey: string): string {
  return createHash('sha256')
    .update(passkey.toUpperCase())
    .digest('hex');
}

/**
 * Verify a passkey against its hash
 */
export function verifyPasskey(passkey: string, hash: string): boolean {
  const inputHash = hashPasskey(passkey.toUpperCase());
  return inputHash === hash;
}

/**
 * Calculate passkey expiration date
 */
export function getPasskeyExpiry(): Date {
  return new Date(Date.now() + PASSKEY_EXPIRY_MS);
}

/**
 * Check if a passkey has expired
 */
export function isPasskeyExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Format passkey for display (add spacing for readability)
 * e.g., "ABCD1234" -> "ABCD-1234"
 */
export function formatPasskey(passkey: string): string {
  if (passkey.length !== PASSKEY_LENGTH) return passkey;
  return `${passkey.slice(0, 4)}-${passkey.slice(4)}`;
}
