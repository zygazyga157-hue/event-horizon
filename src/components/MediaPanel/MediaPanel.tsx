"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioPlayer } from "@/components/MediaPlayer";
import { DocumentReader } from "@/components/DocumentReader";
import { stateDocuments, type StateDocument } from "@/content/docs/sound-sync";
import type { MediaItem } from "@/domain/gallery";

export interface MediaPanelProps {
  media: MediaItem[];
  className?: string;
}

type TabType = "player" | "guide";

/**
 * MediaPanel - Combined audio player and document reader with tabbed interface
 * Features: track selection, tab switching, mobile responsive stacking
 */
export function MediaPanel({ media, className = "" }: MediaPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("player");
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);

  const currentTrack = media[activeTrackIndex];
  const currentDocument: StateDocument | undefined = currentTrack
    ? stateDocuments[currentTrack.documentId]
    : undefined;

  if (!currentTrack) {
    return null;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "player", label: "Player" },
    { id: "guide", label: "Guide" },
  ];

  return (
    <div className={`overflow-hidden rounded-2xl border border-hair bg-paper shadow-museum ${className}`}>
      {/* Track Selector (if multiple tracks) */}
      {media.length > 1 && (
        <div className="border-b border-hair p-4">
          <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-fog">
            Select Track
          </span>
          <div className="flex flex-wrap gap-2">
            {media.map((item, index) => (
              <button
                key={item.documentId}
                onClick={() => setActiveTrackIndex(index)}
                className={`rounded-lg px-3 py-2 font-mono text-xs transition-colors ${
                  activeTrackIndex === index
                    ? "bg-ink text-paper"
                    : "bg-ink/5 text-ink hover:bg-ink/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-hair">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 px-6 py-4 font-mono text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab.id
                ? "text-ink"
                : "text-fog hover:text-ink"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="media-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative min-h-[400px] md:min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "player" && (
            <motion.div
              key="player"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6"
            >
              <AudioPlayer
                src={currentTrack.audioSrc}
                label={currentTrack.label}
              />
              
              {/* Quick Info */}
              <div className="mt-6 rounded-xl bg-ink/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/10">
                    <svg className="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-mono text-xs font-medium text-ink">
                      Before You Begin
                    </h4>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-fog">
                      Read the Guide tab for listening protocol, breathing techniques, and safety information. 
                      Use stereo headphones for binaural effectiveness.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "guide" && currentDocument && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-[400px] md:h-[500px]"
            >
              <DocumentReader document={currentDocument} />
            </motion.div>
          )}

          {activeTab === "guide" && !currentDocument && (
            <motion.div
              key="no-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-[400px] items-center justify-center md:h-[500px]"
            >
              <p className="font-mono text-sm text-fog">
                No documentation available for this track.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
