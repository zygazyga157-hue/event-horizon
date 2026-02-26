"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface PromotionTransitionProps {
  /** Called when the transition animation completes */
  onComplete: () => void;
  /** Duration in ms before auto-completing */
  duration?: number;
}

/**
 * Animated transition shown when user is promoted from queue to active
 * Shows "calibration complete" motion before revealing granted state
 */
export function PromotionTransition({
  onComplete,
  duration = 2500,
}: PromotionTransitionProps) {
  const [phase, setPhase] = useState<"calibrating" | "complete">("calibrating");

  useEffect(() => {
    // Phase 1: Show calibrating for 1.5s
    const calibrateTimer = setTimeout(() => {
      setPhase("complete");
    }, 1500);

    // Phase 2: Complete after full duration
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(calibrateTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, duration]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12 space-y-8 text-center"
    >
      {phase === "calibrating" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <p className="font-mono text-sm uppercase tracking-wider text-fog">
            Calibration in progress...
          </p>

          {/* Scanning line animation */}
          <div className="relative h-20 overflow-hidden">
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-ink"
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute inset-x-0 h-0.5 bg-ink/30"
              initial={{ top: "100%" }}
              animate={{ top: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>

          <p className="font-mono text-xs text-fog/60">
            Verifying queue position...
          </p>
        </motion.div>
      )}

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="space-y-6"
        >
          {/* Checkmark animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-full bg-ink flex items-center justify-center"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-paper"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 12l5 5L20 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
            </motion.svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="font-mono text-lg uppercase tracking-wider text-ink">
              Calibration Complete
            </p>
            <p className="text-fog text-sm">
              Your passage has been granted.
            </p>
          </motion.div>

          {/* 157 alignment message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-mono text-xs text-fog/60 italic"
          >
            Step 7: Enter with intent.
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
