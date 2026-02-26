import { MetadataRoute } from "next";

/**
 * Robots.txt configuration
 * Controls search engine crawler behavior
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zyga.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/library", "/library/about", "/library/contact", "/library/exhibits", "/library/archive"],
        disallow: [
          "/gate",        // Block gate (noindex zone)
          "/admin",       // Block admin routes
          "/api/",        // Block API routes
          "/_next/",      // Block Next.js internals
          "/ws",          // Block WebSocket routes
        ],
      },
      {
        // Block aggressive crawlers
        userAgent: ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
