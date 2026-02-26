import { Metadata, Viewport } from "next";

/**
 * Site-wide SEO configuration
 * Centralized metadata for consistency across pages
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zyga.dev";

export const siteConfig = {
  name: "PROJECT ZYGA",
  title: "Event Horizon Gallery",
  description: "A curated museum of systems, experiments, and artifacts. Portfolio of Mthabisi W. Mkwananzi — Systems Engineer & Full-Stack Developer.",
  author: "Mthabisi W. Mkwananzi",
  email: "zygazyga157@gmail.com",
  url: siteUrl,
  locale: "en_US",
  keywords: [
    "portfolio",
    "systems engineering",
    "full-stack developer",
    "software engineer",
    "Zimbabwe",
    "Harare",
    "Next.js",
    "TypeScript",
    "React",
    "web development",
  ],
  social: {
    github: "https://github.com/zygazyga",
    linkedin: "https://linkedin.com/in/zygazyga",
    twitter: "@zygazyga",
  },
};

/**
 * Base metadata shared across all pages
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    creator: siteConfig.social.twitter,
    images: [`${siteUrl}/og-image.svg`],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  manifest: `${siteUrl}/manifest.json`,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

/**
 * Viewport configuration
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * Generate page-specific metadata
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const { title, description, path = "", image, noIndex = false } = options;
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate exhibit-specific metadata
 */
export function generateExhibitMetadata(exhibit: {
  title: string;
  thesis: string;
  slug: string;
  code: string;
  tags: string[];
}): Metadata {
  const { title, thesis, slug, code, tags } = exhibit;
  const url = `${siteUrl}/library/exhibits/${slug}`;

  return {
    title: `${title} (${code})`,
    description: thesis,
    keywords: [...siteConfig.keywords, ...tags],
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description: thesis,
      url,
      images: [
        {
          url: `${siteUrl}/og/exhibit/${slug}.png`,
          width: 1200,
          height: 630,
          alt: `${code} — ${title}`,
        },
      ],
    },
    twitter: {
      title: `${title} — ${siteConfig.name}`,
      description: thesis,
      images: [`${siteUrl}/og/exhibit/${slug}.png`],
    },
    alternates: {
      canonical: url,
    },
  };
}

// ============================================================
// JSON-LD Structured Data
// ============================================================

/**
 * Person JSON-LD for About page
 */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.author,
  alternateName: "Zyga Zyga",
  email: `mailto:${siteConfig.email}`,
  url: `${siteUrl}/library/about`,
  jobTitle: "Software Developer / Systems Engineer",
  knowsAbout: [
    "Data Engineering",
    "GIS",
    "Cloud Engineering",
    "Cybersecurity",
    "Web3",
    "IoT",
    "Machine Learning",
    "Algorithmic Trading",
  ],
  sameAs: [
    siteConfig.social.github,
    siteConfig.social.linkedin,
  ],
};

/**
 * CollectionPage JSON-LD for Atrium/Library page
 */
export const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `Atrium — ${siteConfig.name}`,
  url: `${siteUrl}/library`,
  description: "A gallery of exhibits and artifacts showcasing systems engineering and development projects.",
  about: {
    "@type": "Person",
    name: siteConfig.author,
  },
};

/**
 * ContactPage JSON-LD for Contact page
 */
export const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: `Contact — ${siteConfig.name}`,
  url: `${siteUrl}/library/contact`,
  about: {
    "@type": "Person",
    name: siteConfig.author,
  },
};

/**
 * Generate CreativeWork JSON-LD for Exhibit pages
 */
export function generateExhibitJsonLd(exhibit: {
  title: string;
  thesis: string;
  slug: string;
  code: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: exhibit.title,
    description: exhibit.thesis,
    url: `${siteUrl}/library/exhibits/${exhibit.slug}`,
    dateModified: exhibit.updatedAt,
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
  };
}

/**
 * Generate SoftwareSourceCode JSON-LD for Artifact pages
 */
export function generateArtifactJsonLd(artifact: {
  name: string;
  description: string;
  id: string;
  stack: string[];
  repoUrl?: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: artifact.name,
    description: artifact.description,
    programmingLanguage: artifact.stack,
    codeRepository: artifact.repoUrl,
    url: `${siteUrl}/library/exhibits/${artifact.id}`,
    dateModified: artifact.updatedAt,
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
  };
}
