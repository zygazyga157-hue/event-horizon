"use client";

import { motion } from "framer-motion";

interface CalibrationLineProps {
  isAnimating?: boolean;
}

/**
 * Signature calibration line animation
 */
export function CalibrationLine({ isAnimating = true }: CalibrationLineProps) {
  return (
    <div className="w-full h-px overflow-hidden">
      <motion.div
        className="h-full bg-linear-to-r from-transparent via-ink to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          isAnimating
            ? { scaleX: 1, opacity: [0, 1, 1, 0] }
            : { scaleX: 0, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
          opacity: { times: [0, 0.2, 0.8, 1] },
        }}
        style={{ transformOrigin: "left center" }}
      />
    </div>
  );
}
