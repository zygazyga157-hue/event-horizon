import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Security headers for all routes
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
      {
        // Extra cache control for static assets
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // No cache for API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirects for common security patterns
  async redirects() {
    return [
      // Block common vulnerability scanners
      {
        source: "/wp-admin/:path*",
        destination: "/gate",
        permanent: false,
      },
      {
        source: "/wp-login.php",
        destination: "/gate",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/gate",
        permanent: false,
      },
      {
        source: "/.env",
        destination: "/gate",
        permanent: false,
      },
      {
        source: "/config/:path*",
        destination: "/gate",
        permanent: false,
      },
      // Normalize trailing slashes
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },

  // Image optimization settings
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features
  experimental: {
    // Enable server actions with size limit
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Powered-by header removal
  poweredByHeader: false,
};

export default nextConfig;
