/* eslint-disable no-restricted-globals */
/**
 * Service Worker for PROJECT ZYGA — Event Horizon Gallery
 * 
 * Strategy:
 * - Cache static assets and safe public pages
 * - Never cache admin, auth, or bidding endpoints
 * - Provide offline fallback for navigations
 */

const CACHE_NAME = "zyga-cache-v1";
const OFFLINE_URL = "/offline.html";

// Safe routes to pre-cache (public, non-sensitive)
const PRECACHE_ROUTES = [
  "/",
  "/offline.html",
  "/library",
  "/library/about",
  "/library/contact",
  "/library/archive",
  "/favicon.svg",
  "/favicon.ico",
  "/manifest.json",
];

// Routes that should NEVER be cached
const NEVER_CACHE_PATTERNS = [
  /^\/admin/,         // Admin routes
  /^\/api\/admin/,    // Admin API
  /^\/api\/gate/,     // Gate/auth endpoints
  /^\/api\/auctions/, // Bidding endpoints (realtime correctness)
  /^\/gate/,          // Gate page (session-dependent)
];

/**
 * Check if a URL should never be cached
 */
function shouldNeverCache(pathname) {
  return NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Install event - pre-cache essential assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Pre-cache safe routes (fail silently for missing)
      await Promise.allSettled(
        PRECACHE_ROUTES.map((url) => cache.add(url).catch(() => {}))
      );
      
      // Activate immediately
      self.skipWaiting();
    })()
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old cache versions
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => 
          key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()
        )
      );
      
      // Take control of all clients immediately
      self.clients.claim();
    })()
  );
});

/**
 * Fetch event - network-first for navigations, cache-first for assets
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Never intercept restricted routes
  if (shouldNeverCache(url.pathname)) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Network first for navigations
          const networkResponse = await fetch(request);
          
          // Cache successful responses for next time
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // Network failed - try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // No cache - return offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Handle static assets (cache-first)
  event.respondWith(
    (async () => {
      // Check cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache - fetch from network
      try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Asset fetch failed - return empty response
        return new Response("", { status: 503 });
      }
    })()
  );
});

/**
 * Message handler for cache control
 */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME);
  }
});
