/**
 * Admin Detection Logic
 * 
 * Determines if a Gate sign-in request should trigger the admin passkey flow.
 * Admin credentials: displayName="Zyga", email="sigasaint@gmail.com", purpose="client"
 */

// Admin credentials (could be moved to env vars for flexibility)
const ADMIN_DISPLAY_NAME = 'Zyga';
const ADMIN_EMAIL = 'sigasaint@gmail.com';
const ADMIN_PURPOSE = 'client';

export interface AdminCheckResult {
  isAdmin: boolean;
  email: string | null;
}

/**
 * Check if the provided credentials match the admin profile
 */
export function checkAdminCredentials(
  displayName: string,
  email?: string | null,
  purpose?: string | null
): AdminCheckResult {
  // All three must match exactly
  const isAdmin = 
    displayName.toLowerCase() === ADMIN_DISPLAY_NAME.toLowerCase() &&
    email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    purpose?.toLowerCase() === ADMIN_PURPOSE.toLowerCase();
  
  return {
    isAdmin,
    email: isAdmin ? ADMIN_EMAIL : null,
  };
}

/**
 * Validate admin email format
 */
export function isValidAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Get the admin email address (for passkey sending)
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}
