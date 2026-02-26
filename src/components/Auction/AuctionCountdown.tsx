/**
 * Countdown Timer for Auction End Time
 */
"use client";

import { useSyncExternalStore, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuctionCountdownProps {
  endsAt: string | null;
  onEnd?: () => void;
  className?: string;
  showLabels?: boolean;
}

interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeComponents(ms: number): TimeComponents {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const { days, hours, minutes, seconds } = getTimeComponents(ms);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Use useSyncExternalStore for time to avoid React compiler warnings
function useCurrentTime(intervalMs: number = 1000) {
  return useSyncExternalStore(
    (callback) => {
      const interval = setInterval(callback, intervalMs);
      return () => clearInterval(interval);
    },
    () => Date.now(),
    () => Date.now()
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-ink tabular-nums"
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span className="text-[9px] text-fog uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function AuctionCountdown({
  endsAt,
  onEnd,
  className = "",
  showLabels = false,
}: AuctionCountdownProps) {
  const now = useCurrentTime(1000);
  const hasEndedRef = useRef(false);

  // Calculate time left
  const timeLeft = endsAt ? new Date(endsAt).getTime() - now : null;
  
  // Handle end callback using effect to satisfy React compiler
  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !hasEndedRef.current && onEnd) {
      hasEndedRef.current = true;
      onEnd();
    }
  });

  if (timeLeft === null) {
    return (
      <span className={`font-mono text-fog ${className}`}>No deadline</span>
    );
  }

  const isUrgent = timeLeft < 5 * 60 * 1000; // Less than 5 minutes
  const isEnded = timeLeft <= 0;
  const { days, hours, minutes, seconds } = getTimeComponents(timeLeft);

  // Detailed view with labels
  if (showLabels && !isEnded) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {days > 0 && (
          <>
            <TimeUnit value={days} label="days" />
            <span className="text-fog text-lg">:</span>
          </>
        )}
        <TimeUnit value={hours} label="hrs" />
        <span className="text-fog text-lg">:</span>
        <TimeUnit value={minutes} label="min" />
        <span className="text-fog text-lg">:</span>
        <TimeUnit value={seconds} label="sec" />
      </div>
    );
  }

  // Compact view
  return (
    <span
      className={`font-mono tabular-nums ${
        isEnded 
          ? "text-fog" 
          : isUrgent 
            ? "text-ink font-bold" 
            : "text-ink"
      } ${className}`}
    >
      {isEnded ? "Ended" : formatTimeLeft(timeLeft)}
    </span>
  );
}
