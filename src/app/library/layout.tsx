import { generatePageMetadata, collectionJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Atrium",
  description: "Browse the curated exhibits at Event Horizon Gallery. Explore systems engineering, development projects, and technical artifacts.",
  path: "/library",
});

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
