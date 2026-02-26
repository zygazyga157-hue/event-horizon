/**
 * Auction Card Component
 * Compact display of auction state for artifact cards
 */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { AuctionCountdown } from "./AuctionCountdown";
import { formatCurrency, BID_TYPE_LABELS } from "@/lib/bidding/constants";
import type { AuctionStateSnapshot } from "@/lib/bidding/types";

interface AuctionCardProps {
  state: AuctionStateSnapshot;
  onBidClick?: () => void;
  className?: string;
}

export function AuctionCard({
  state,
  onBidClick,
  className = "",
}: AuctionCardProps) {
  const {
    status,
    currency,
    openingBid,
    currentBid,
    minIncrement,
    leadingBidderName,
    bidCount,
    endsAt,
    kind,
    allowedBidTypes,
  } = state;

  const displayBid = currentBid ?? openingBid;
  const minNextBid = (currentBid ?? openingBid) + minIncrement;
  const isLive = status === "LIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-hair bg-paper shadow-museum overflow-hidden ${className}`}
    >
      {/* Live Banner */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-ink text-paper px-4 py-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-paper opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-paper" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider">Live Auction</span>
            </div>
            <span className="text-xs font-mono opacity-70">
              {kind === "ACQUIREMENT" ? "Acquirement" : "Funding"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Header for non-live */}
        {!isLive && (
          <div className="flex items-center justify-between mb-4">
            <AuctionStatusBadge status={status} />
            <span className="text-xs text-fog font-mono">
              {kind === "ACQUIREMENT" ? "Acquirement" : "Funding"}
            </span>
          </div>
        )}

        {/* Current Bid - Hero Section */}
        <div className="mb-4">
          <div className="text-xs text-fog mb-1 font-mono uppercase tracking-wider">
            {currentBid ? "Current Bid" : "Starting Bid"}
          </div>
          <motion.div
            key={displayBid}
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-ink tracking-tight"
          >
            {formatCurrency(displayBid, currency)}
          </motion.div>
          {leadingBidderName && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-fog mt-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Leading: {leadingBidderName}</span>
            </motion.div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-hair/50 rounded-lg p-3">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1">Bids</div>
            <div className="text-lg font-bold text-ink">{bidCount}</div>
          </div>
          <div className="bg-hair/50 rounded-lg p-3">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1">Min Next</div>
            <div className="text-lg font-bold text-ink">{formatCurrency(minNextBid, currency)}</div>
          </div>
        </div>

        {/* Timer */}
        {endsAt && (
          <div className="mb-4 p-3 rounded-lg bg-hair/30 border border-hair">
            <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-1 text-center">
              {isLive ? "Ends in" : "Ended"}
            </div>
            <AuctionCountdown endsAt={endsAt} className="text-center text-lg" />
          </div>
        )}

        {/* Bid Types */}
        <div className="mb-4">
          <div className="text-[10px] text-fog font-mono uppercase tracking-wider mb-2">Accepted Bids</div>
          <div className="flex flex-wrap gap-1.5">
            {allowedBidTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-[11px] rounded-md bg-hair text-ink font-mono"
              >
                {BID_TYPE_LABELS[type] || type}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {isLive && onBidClick && (
          <motion.button
            onClick={onBidClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg bg-ink hover:bg-ink/90 text-paper font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Place Your Bid
          </motion.button>
        )}

        {status === "ENDED" && (
          <div className="text-center py-3 rounded-lg bg-hair/30 text-fog text-sm font-mono">
            Auction Closed
          </div>
        )}

        {status === "PAUSED" && (
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
