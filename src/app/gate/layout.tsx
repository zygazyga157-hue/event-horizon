import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  title: "The Gate",
  description: "Welcome to Event Horizon Gallery. Sign the ledger to enter the museum of systems, experiments, and artifacts.",
  path: "/gate",
  noIndex: true, // Gate is a noindex zone
});

export default function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
