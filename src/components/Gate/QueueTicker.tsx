"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueTickerProps {
  position: number;
  activeCount: number;
  capacity: number;
  queueLength?: number;
}

// 157 Triad messages for waiting state
const waitingMessages = [
  "Step 5: Accept the drift.",
  "Capacity is a law; waiting is not denial.",
  "The corridor reshapes around load.",
  "Patience is the first principle of access.",
  "The ledger honors order, not urgency.",
];

/**
 * Queue position display with live updates and animations
 */
export function QueueTicker({ position, activeCount, capacity, queueLength }: QueueTickerProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [prevPosition, setPrevPosition] = useState(position);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Rotate messages every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % waitingMessages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Detect position advancement
  useEffect(() => {
    if (position < prevPosition) {
      setIsAdvancing(true);
      const timeout = setTimeout(() => setIsAdvancing(false), 1500);
      setPrevPosition(position);
      return () => clearTimeout(timeout);
    }
    setPrevPosition(position);
  }, [position, prevPosition]);

  // Estimate wait time (rough: ~30s per person based on natural churn)
  const estimatedMinutes = Math.max(1, Math.ceil(position * 0.5));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      {/* Queue position */}
      <div className="space-y-3">
        <p className="font-mono text-sm uppercase tracking-plaque text-fog">
          Queue Position
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={position}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 25 }
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`font-mono text-5xl md:text-6xl font-light transition-colors duration-500 ${
              isAdvancing ? "text-ink" : "text-ink/80"
            }`}
          >
            Q-157-{String(position).padStart(3, "0")}
          </motion.div>
        </AnimatePresence>

        {/* Position advancement indicator */}
        <AnimatePresence>
          {isAdvancing && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono text-ink uppercase tracking-wider"
            >
              ↑ Position advancing
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Occupancy bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-1">
              Inside
            </p>
            <p className="font-mono text-2xl text-ink">{activeCount}</p>
          </div>
          <div className="text-fog text-2xl">/</div>
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-1">
              Capacity
            </p>
            <p className="font-mono text-2xl text-fog">{capacity}</p>
          </div>
          {queueLength !== undefined && queueLength > 0 && (
            <>
              <div className="w-px h-8 bg-hair mx-2" />
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-1">
                  Queue
                </p>
                <p className="font-mono text-2xl text-fog">{queueLength}</p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-1.5 bg-hair rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ink"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (activeCount / capacity) * 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Estimated wait */}
      <div className="py-4 px-6 bg-hair/50 rounded-lg">
        <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-1">
          Estimated Wait
        </p>
        <p className="font-mono text-lg text-ink">
          ~{estimatedMinutes} {estimatedMinutes === 1 ? "minute" : "minutes"}
        </p>
      </div>

      {/* Rotating message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="text-fog text-sm italic"
        >
          {waitingMessages[messageIndex]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}
