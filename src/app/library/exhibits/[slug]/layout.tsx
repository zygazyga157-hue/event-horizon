import { generateExhibitMetadata, generateExhibitJsonLd } from "@/lib/seo";
import { exhibits } from "@/content";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exhibit = exhibits.find((e) => e.slug === slug);

  if (!exhibit) {
    return {
      title: "Exhibit Not Found",
      description: "The requested exhibit could not be found.",
    };
  }

  return generateExhibitMetadata({
    title: exhibit.title,
    thesis: exhibit.thesis,
    slug: exhibit.slug,
    code: exhibit.code,
    tags: exhibit.tags,
  });
}

export function generateStaticParams() {
  return exhibits.map((exhibit) => ({
    slug: exhibit.slug,
  }));
}

export default async function ExhibitLayout({
  params,
  children,
}: Props) {
  const { slug } = await params;
  const exhibit = exhibits.find((e) => e.slug === slug);

  // Generate JSON-LD for the exhibit
  const jsonLd = exhibit
    ? generateExhibitJsonLd({
        title: exhibit.title,
        thesis: exhibit.thesis,
        slug: exhibit.slug,
        code: exhibit.code,
        updatedAt: exhibit.updatedAt,
      })
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
