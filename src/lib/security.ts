/**
 * Security headers configuration
 * Implements OWASP recommended headers for web security
 */

export interface SecurityHeaders {
  key: string;
  value: string;
}

/**
 * Content Security Policy directives
 * Restricts resource loading to prevent XSS and injection attacks
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  media-src 'self' blob: data:;
  connect-src 'self' blob: ws: wss: https:;
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/**
 * Permissions Policy (formerly Feature Policy)
 * Controls browser feature access
 */
const PermissionsPolicy = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "browsing-topics=()",
  "interest-cohort=()",    // Opt out of FLoC
  "payment=()",
  "usb=()",
  "accelerometer=()",
  "gyroscope=()",
  "magnetometer=()",
].join(", ");

/**
 * Get security headers for Next.js config
 */
export function getSecurityHeaders(): SecurityHeaders[] {
  return [
    // Prevent XSS attacks
    {
      key: "X-XSS-Protection",
      value: "1; mode=block",
    },
    // Prevent clickjacking
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    // Prevent MIME type sniffing
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    // Control referrer information
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    // Content Security Policy
    {
      key: "Content-Security-Policy",
      value: ContentSecurityPolicy,
    },
    // Permissions Policy
    {
      key: "Permissions-Policy",
      value: PermissionsPolicy,
    },
    // Force HTTPS (HSTS)
    {
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    },
    // Prevent information leakage
    {
      key: "X-DNS-Prefetch-Control",
      value: "on",
    },
    // Cross-Origin policies
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "same-origin",
    },
    {
      key: "Cross-Origin-Embedder-Policy",
      value: "credentialless",
    },
  ];
}

/**
 * Rate limiting configuration
 * For use with API routes
 */
export const rateLimitConfig = {
  // General API limits
  api: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 100,         // 100 requests per minute
  },
  // Gate check-in limits (stricter)
  checkin: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 10,          // 10 attempts per minute
  },
  // Heartbeat limits (more lenient)
  heartbeat: {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 30,          // 30 heartbeats per minute (every 2 sec)
  },
  // Contact form limits
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,           // 5 submissions per hour
  },
};

/**
 * CORS configuration for API routes
 */
export const corsConfig = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || "https://zyga.dev",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  allowedMethods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

/**
 * Cookie security options
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};

/**
 * Validate origin for CSRF protection
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  
  if (!origin || !host) return false;
  
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host || corsConfig.allowedOrigins.includes(origin);
  } catch {
    return false;
  }
}

/**
 * Generate nonce for inline scripts (CSP)
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}
