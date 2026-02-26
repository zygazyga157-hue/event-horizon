"use client";

import { motion } from "framer-motion";
import { MeasureFrame } from "./MeasureFrame";

interface PlacardProps {
  what: string;
  why: string;
  approach: string;
  title?: string;
}

/**
 * Museum-style placard for exhibit explanatory content
 * Displays what/why/approach structure
 */
export function Placard({ what, why, approach, title = "Curatorial Placard" }: PlacardProps) {
  const sections = [
    { label: "What it is", content: what },
    { label: "Why it matters", content: why },
    { label: "Approach", content: approach },
  ];

  return (
    <MeasureFrame
      meta="PLACARD"
      showMeta
      className="p-8 bg-paper shadow-museum rounded-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6"
      >
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="space-y-2"
            >
              <h3 className="font-mono text-xs uppercase tracking-plaque text-fog">
                {section.label}
              </h3>
              <p className="text-ink leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MeasureFrame>
  );
}
