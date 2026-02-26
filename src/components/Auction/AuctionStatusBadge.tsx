/**
 * Auction Status Badge Component
 * Displays live/paused/ended status with appropriate colors
 */
"use client";

import { motion } from "framer-motion";
import type { AuctionStatus } from "@/lib/bidding/types";

interface AuctionStatusBadgeProps {
  status: AuctionStatus;
  className?: string;
}

const statusConfig: Record<
  AuctionStatus,
  { label: string; bg: string; text: string; pulse: boolean }
> = {
  DRAFT: {
    label: "DRAFT",
    bg: "bg-hair/50",
    text: "text-fog",
    pulse: false,
  },
  SCHEDULED: {
    label: "SCHEDULED",
    bg: "bg-hair",
    text: "text-ink",
    pulse: false,
  },
  LIVE: {
    label: "LIVE",
    bg: "bg-ink",
    text: "text-paper",
    pulse: true,
  },
  PAUSED: {
    label: "PAUSED",
    bg: "bg-hair",
    text: "text-fog",
    pulse: false,
  },
  ENDED: {
    label: "ENDED",
    bg: "bg-hair",
    text: "text-fog",
    pulse: false,
  },
};

export function AuctionStatusBadge({
  status,
  className = "",
}: AuctionStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono uppercase ${config.bg} ${config.text} ${className}`}
    >
      {config.pulse && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {config.label}
    </span>
  );
}
