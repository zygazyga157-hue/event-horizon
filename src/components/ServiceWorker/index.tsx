"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * 
 * Registers the service worker in production environments.
 * Provides offline fallback and asset caching for the PWA experience.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]";

    // Register in production, or on localhost for testing
    if (process.env.NODE_ENV === "production" || isLocalhost) {
      registerServiceWorker();
    }
  }, []);

  return null;
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update().catch(() => {});
    }, 60 * 60 * 1000);

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker available, could show update prompt
          console.log("[SW] New version available");
        }
      });
    });

    console.log("[SW] Registered successfully");
  } catch (error) {
    console.error("[SW] Registration failed:", error);
  }
}

/**
 * Force update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    
    // Tell waiting worker to skip waiting
    if (registration.waiting) {
      registration.waiting.postMessage("SKIP_WAITING");
    }
  }
}

/**
 * Clear all service worker caches
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.active) {
    registration.active.postMessage("CLEAR_CACHE");
  }
}

export default ServiceWorkerRegister;
