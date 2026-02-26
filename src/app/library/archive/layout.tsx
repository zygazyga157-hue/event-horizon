import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "Archive",
  description: "Browse all artifacts across exhibits. Search, filter, and explore the complete collection of projects and systems.",
  path: "/library/archive",
});

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
