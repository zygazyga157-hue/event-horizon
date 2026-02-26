import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Ledger",
  description: "Get in touch for collaboration, consulting, or opportunities. Available for systems engineering, full-stack development, and technical projects.",
  path: "/library/contact",
});
