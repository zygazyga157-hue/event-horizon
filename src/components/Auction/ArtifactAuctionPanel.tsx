/**
 * Artifact Auction Panel
 * 
 * @deprecated Auctions have been moved to the Exhibit level.
 * Use ExhibitAuctionPanel instead.
 * This component is kept for backwards compatibility but renders nothing.
 */
"use client";

import type { Artifact } from "@/domain/gallery";

interface ArtifactAuctionPanelProps {
  artifact: Artifact;
  exhibitSlug: string;
}

/**
 * @deprecated Use ExhibitAuctionPanel instead.
 * Auctions are now at the exhibit level, not artifact level.
 */
export function ArtifactAuctionPanel(_props: ArtifactAuctionPanelProps) {
  // Deprecated - auctions moved to exhibit level
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[ArtifactAuctionPanel] This component is deprecated. Auctions are now at the exhibit level. Use ExhibitAuctionPanel instead."
    );
  }
  return null;
}
