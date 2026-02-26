"use client";

import { motion } from "framer-motion";

interface AvailabilityStripProps {
  status?: "open" | "selective" | "unavailable";
  focus?: string;
  lastUpdate?: string;
}

const statusConfig = {
  open: {
    label: "Open to Work",
    color: "bg-ink text-paper",
    dot: "bg-paper",
  },
  selective: {
    label: "Selectively Available",
    color: "bg-hair text-ink",
    dot: "bg-ink",
  },
  unavailable: {
    label: "Currently Unavailable",
    color: "bg-hair text-fog",
    dot: "bg-fog",
  },
};

/**
 * Top strip showing work availability, current focus, and latest update
 */
export function AvailabilityStrip({
  status = "open",
  focus = "Full-stack systems",
  lastUpdate = "2026-01-24",
}: AvailabilityStripProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-hair"
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Status badge */}
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
              {config.label}
            </span>

            {/* Focus area */}
            <span className="text-fog hidden sm:inline">
              Focus: <span className="text-ink">{focus}</span>
            </span>
          </div>

          {/* Last update */}
          <span className="text-fog">
            Updated: <span className="text-ink">{lastUpdate}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
