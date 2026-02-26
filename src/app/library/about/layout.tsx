import { generatePageMetadata, personJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Curator",
  description: "About Mthabisi W. Mkwananzi — Systems engineer and full-stack developer. Learn about my approach, principles, and technical expertise.",
  path: "/library/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  );
}
