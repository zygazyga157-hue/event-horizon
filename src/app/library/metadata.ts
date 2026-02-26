import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Atrium",
  description: "Browse the curated exhibits at Event Horizon Gallery. Explore systems engineering, development projects, and technical artifacts.",
  path: "/library",
});
