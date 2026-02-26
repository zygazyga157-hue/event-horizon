import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Curator",
  description: "About Mthabisi W. Mkwananzi — Systems engineer and full-stack developer. Learn about my approach, principles, and technical expertise.",
  path: "/library/about",
});
