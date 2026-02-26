"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MeasureFrame } from "@/components/MeasureFrame";
import { StatusBadge } from "@/components/StatusBadge";
import type { Exhibit } from "@/domain/gallery";

interface ExhibitCardProps {
  exhibit: Exhibit;
}

/**
 * Exhibit card for the Atrium gallery wall
 * Museum-style card with MeasureFrame, hover effects, and status indicator
 */
export function ExhibitCard({ exhibit }: ExhibitCardProps) {
  const artifactCount = exhibit.artifacts.length;
  const completedRoadmap = exhibit.roadmap?.items.filter((i) => i.done).length ?? 0;
  const totalRoadmap = exhibit.roadmap?.items.length ?? 0;

  return (
    <Link href={`/library/exhibits/${exhibit.slug}`} className="block group">
      <motion.div
        whileHover={{ scale: 1.015 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <MeasureFrame
          meta={exhibit.metaLine || `${exhibit.code} / ${exhibit.version} / Updated ${exhibit.updatedAt}`}
          showMeta
          className="p-6 bg-paper rounded-2xl shadow-museum group-hover:shadow-lg transition-shadow duration-300"
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-plaque text-fog">
                  {exhibit.code}
                </p>
                <h3 className="text-xl font-medium tracking-tight text-ink group-hover:underline underline-offset-4">
                  {exhibit.title}
                </h3>
              </div>
              <StatusBadge status={exhibit.status} />
            </div>

            {/* Thesis */}
            <p className="text-fog text-sm leading-relaxed line-clamp-2">
              {exhibit.thesis}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {exhibit.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-hair text-ink text-xs font-mono rounded"
                >
                  {tag}
                </span>
              ))}
              {exhibit.tags.length > 4 && (
                <span className="px-2 py-0.5 text-fog text-xs font-mono">
                  +{exhibit.tags.length - 4}
                </span>
              )}
            </div>

            {/* Stats bar */}
            <div className="pt-4 border-t border-hair flex items-center justify-between text-xs font-mono text-fog">
              <span>
                {artifactCount} {artifactCount === 1 ? "artifact" : "artifacts"}
              </span>
              {totalRoadmap > 0 && (
                <span>
                  {completedRoadmap}/{totalRoadmap} milestones
                </span>
              )}
            </div>
          </div>
        </MeasureFrame>
      </motion.div>
    </Link>
  );
}
