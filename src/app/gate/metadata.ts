import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Gate",
  description: "Welcome to Event Horizon Gallery. Sign the ledger to enter the museum of systems, experiments, and artifacts.",
  path: "/gate",
});
