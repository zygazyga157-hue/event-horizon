import { MetadataRoute } from "next";
import { exhibits } from "@/content";

/**
 * Generate sitemap for search engines
 * Includes all static pages and dynamic exhibit routes
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zyga.dev";

  // Static pages (excludes /gate and /admin - noindex zones)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/library/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/library/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/library/archive`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic exhibit pages
  const exhibitPages: MetadataRoute.Sitemap = exhibits.map((exhibit) => ({
    url: `${baseUrl}/library/exhibits/${exhibit.slug}`,
    lastModified: new Date(exhibit.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...exhibitPages];
}
