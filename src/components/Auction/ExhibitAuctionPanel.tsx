/**
 * Exhibit Auction Panel
 * Displays auction UI for exhibits with live auctions (single auction per exhibit)
 */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuctionCard, BiddingModal } from "@/components/Auction";
import { useAuctionState } from "@/hooks/useAuctionState";
import { BID_TYPE_LABELS } from "@/lib/bidding/constants";
import type { Exhibit, Auction } from "@/domain/gallery";

interface ExhibitAuctionPanelProps {
  exhibit: Exhibit;
}

/**
 * Static auction preview when DB auction not synced
 */
function StaticAuctionPreview({ auction, exhibitTitle }: { auction: Auction; exhibitTitle: string }) {
  const isLive = auction.status === "LIVE";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-hair bg-paper shadow-museum overflow-hidden"
    >
      {/* Status Banner */}
      <div className={`px-4 py-2 flex items-center justify-between ${isLive ? "bg-ink text-paper" : "bg-hair"}`}>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-paper opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-paper" />
            </span>
          )}
          <span className={`text-xs font-mono uppercase tracking-wider ${isLive ? "" : "text-fog"}`}>
            {auction.status === "LIVE" ? "Live Auction" : auction.status}
          </span>
        </div>
        <span className={`text-xs font-mono ${isLive ? "opacity-70" : "text-fog"}`}>
          {auction.auctionKind === "ACQUIREMENT" ? "Acquirement" : "Funding"}
        </span>
      </div>

      <div className="p-5">
        {/* Exhibit Title */}
        <div className="text-sm font-medium text-fog mb-2">{exhibitTitle}</div>
        
        {/* Opening Bid */}
        <div className="mb-4">
          <div className="text-xs text-fog mb-1 font-mono uppercase tracking-wider">
            Starting Bid
          </div>
          <div className="text-3xl font-bold text-ink tracking-tight">
            {auction.openingBid} {auction.currency}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-hair/50 rounded-lg p-3">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1">Min Increment</div>
            <div className="text-lg font-bold text-ink">{auction.minIncrement} {auction.currency}</div>
          </div>
          <div className="bg-hair/50 rounded-lg p-3">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1">Currency</div>
            <div className="text-lg font-bold text-ink">{auction.currency}</div>
          </div>
        </div>

        {/* End Date */}
        {auction.endsAt && (
          <div className="mb-4 p-3 rounded-lg bg-hair/30 border border-hair text-center">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1">Auction Ends</div>
            <div className="text-sm font-mono text-ink">
              {new Date(auction.endsAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}

        {/* Bid Types */}
        <div className="mb-4">
          <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-2">Accepted Bids</div>
          <div className="flex flex-wrap gap-1.5">
            {auction.allowedBidTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-[11px] rounded-md bg-hair text-ink font-mono"
              >
                {BID_TYPE_LABELS[type] || type}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        {isLive && (
          <div className="p-3 rounded-lg bg-hair/50 text-center">
            <p className="text-xs text-fog mb-2">Auction activating soon</p>
            <a
              href="/library/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact to Bid
            </a>
          </div>
        )}

        {auction.status === "PAUSED" && (
          <div className="text-center py-3 rounded-lg bg-hair/50 text-fog text-sm font-mono flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bidding Paused
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Fetches auction by exhibit slug, then displays auction UI
 */
export function ExhibitAuctionPanel({ exhibit }: ExhibitAuctionPanelProps) {
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [loadingAuction, setLoadingAuction] = useState(true);

  // Fetch auction ID on mount
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(
          `/api/auctions?exhibitSlug=${encodeURIComponent(exhibit.slug)}`
        );
        if (res.ok) {
          const auctions = await res.json();
          if (auctions.length > 0 && auctions[0].status !== "ENDED") {
            setAuctionId(auctions[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch auction:", err);
      } finally {
        setLoadingAuction(false);
      }
    };

    // Only fetch if exhibit has auction config
    if (exhibit.auction) {
      fetchAuction();
    } else {
      setLoadingAuction(false);
    }
  }, [exhibit.slug, exhibit.auction]);

  // Use the realtime auction state hook
  const { data: auctionState, loading, error, placeBid } = useAuctionState(auctionId);

  // Don't render if no auction configured
  if (!exhibit.auction) {
    return null;
  }

  // Loading state
  if (loadingAuction || (auctionId && loading)) {
    return (
      <div className="animate-pulse">
        <div className="rounded-xl border border-hair bg-paper p-6">
          <div className="h-4 w-20 bg-hair rounded mb-4" />
          <div className="h-8 w-32 bg-hair rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-hair rounded" />
            <div className="h-16 bg-hair rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Show static preview if no DB auction synced yet
  if (!auctionId || error) {
    return <StaticAuctionPreview auction={exhibit.auction} exhibitTitle={exhibit.title} />;
  }

  // Show synced auction with real-time state
  if (!auctionState) {
    return <StaticAuctionPreview auction={exhibit.auction} exhibitTitle={exhibit.title} />;
  }

  return (
    <>
      <AuctionCard
        state={auctionState}
        onBidClick={() => setShowBidModal(true)}
      />

      <BiddingModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        state={auctionState}
        artifactName={exhibit.title}
        onPlaceBid={placeBid}
      />
    </>
  );
}
