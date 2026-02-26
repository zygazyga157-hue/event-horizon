/**
 * Simple in-memory rate limiter for API routes
 * For production, use Redis or a distributed store
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (per serverless instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Every minute

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (IP, session ID, etc.)
 * @param options - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses CF-Connecting-IP, X-Forwarded-For, or falls back to a hash
 */
export function getClientIdentifier(request: Request): string {
  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return `ip:${cfIp}`;

  // Standard proxy header
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    return `ip:${ip}`;
  }

  // Vercel
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp}`;

  // Fallback to user agent hash (less reliable)
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua:${hashString(userAgent)}`;
}

/**
 * Simple string hash for fallback identification
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetTime),
        "Retry-After": String(result.retryAfter || 60),
      },
    }
  );
}

/**
 * Create rate limiter middleware for API routes
 */
export function createRateLimiter(options: RateLimitOptions) {
  return (request: Request): RateLimitResult => {
    const identifier = getClientIdentifier(request);
    return checkRateLimit(identifier, options);
  };
}
