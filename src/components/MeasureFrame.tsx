"use client";

import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

interface MeasureFrameProps {
  meta?: string;
  className?: string;
  showMeta?: boolean;
  id?: string;
}

/**
 * Signature museum motif - measurement frame with corner brackets
 */
export function MeasureFrame({
  children,
  meta,
  className = "",
  showMeta = false,
  id,
}: PropsWithChildren<MeasureFrameProps>) {
  const corners = ["tl", "tr", "bl", "br"] as const;

  return (
    <div id={id} className={`relative ${className}`}>
      {/* Hairline border */}
      <div className="pointer-events-none absolute inset-0 border border-hair rounded-2xl" />

      {/* Corner brackets */}
      {corners.map((pos) => (
        <span
          key={pos}
          className={[
            "pointer-events-none absolute h-5 w-5",
            pos === "tl" && "left-0 top-0 border-l-2 border-t-2 border-ink rounded-tl-2xl",
            pos === "tr" && "right-0 top-0 border-r-2 border-t-2 border-ink rounded-tr-2xl",
            pos === "bl" && "left-0 bottom-0 border-l-2 border-b-2 border-ink rounded-bl-2xl",
            pos === "br" && "right-0 bottom-0 border-r-2 border-b-2 border-ink rounded-br-2xl",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}

      {/* Metadata line */}
      {meta && (
        <motion.div
          initial={{ opacity: showMeta ? 1 : 0, y: showMeta ? 0 : 6 }}
          animate={{ opacity: showMeta ? 1 : 0, y: showMeta ? 0 : 6 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -bottom-7 left-0 font-mono text-xs text-fog tracking-wide"
        >
          {meta}
        </motion.div>
      )}

      {children}
    </div>
  );
}
