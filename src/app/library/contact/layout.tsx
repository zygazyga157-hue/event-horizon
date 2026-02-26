import { generatePageMetadata, contactJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Ledger",
  description: "Get in touch for collaboration, consulting, or opportunities. Available for systems engineering, full-stack development, and technical projects.",
  path: "/library/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
