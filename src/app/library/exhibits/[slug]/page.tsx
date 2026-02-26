"use client";

import { useMemo, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MeasureFrame } from "@/components/MeasureFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { Placard } from "@/components/Placard";
import { HeartbeatClient } from "@/components/Gate";
import { MediaPanel } from "@/components/MediaPanel";
import { ExhibitAuctionPanel } from "@/components/Auction";
import { useSessionErrors } from "@/hooks/useSessionErrors";
import { exhibits } from "@/content";
import type { Artifact, Exhibit } from "@/domain/gallery";

function ArtifactCard({ artifact, exhibitSlug }: { artifact: Artifact; exhibitSlug: string }) {
  const hasProof = artifact.proof?.results && artifact.proof.results.length > 0;
  const hasLinks = artifact.links && artifact.links.length > 0;
  const hasCosts = artifact.costs?.monthly || artifact.costs?.oneTime;
  const hasOpportunities = artifact.opportunities?.acceptedTypes?.length;
  const hasMedia = artifact.media && artifact.media.length > 0;

  return (
    <MeasureFrame
      meta={`${artifact.id} / ${artifact.status} / ${artifact.updatedAt}`}
      showMeta
      className="p-6 bg-paper shadow-museum rounded-2xl"
      id={artifact.id}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium mb-1">{artifact.name}</h3>
            <StatusBadge status={artifact.status as any} />
          </div>
          {hasLinks && (
            <div className="flex gap-2">
              {artifact.links!.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-mono border border-hair rounded-lg hover:bg-ink hover:text-paper transition-colors"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-fog leading-relaxed">{artifact.description}</p>

        {/* Media Panel (if artifact has audio/docs) */}
        {hasMedia && (
          <MediaPanel media={artifact.media!} className="mt-6" />
        )}

        {/* Stack */}
        <div>
          <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-2">
            Tech Stack
          </p>
          <div className="flex flex-wrap gap-2">
            {artifact.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-hair text-ink text-sm font-mono rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Proof */}
        {hasProof && (
          <div>
            <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-2">
              Results & Proof
            </p>
            <ul className="space-y-2">
              {artifact.proof!.results!.map((result, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-ink rounded-full shrink-0" />
                  <span>{result}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Costs & Opportunities row */}
        {(hasCosts || hasOpportunities) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-hair">
            {/* Costs */}
            {hasCosts && (
              <div>
                <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                  Costs
                </p>
                <div className="space-y-1 text-sm">
                  {artifact.costs?.monthly && (
                    <p>
                      <span className="text-fog">Monthly:</span>{" "}
                      <span className="font-mono">{artifact.costs.monthly}</span>
                    </p>
                  )}
                  {artifact.costs?.oneTime && (
                    <p>
                      <span className="text-fog">One-time:</span>{" "}
                      <span className="font-mono">{artifact.costs.oneTime}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {hasOpportunities && (
              <div>
                <p className="font-mono text-xs uppercase tracking-plaque text-fog mb-2">
                  Opportunities
                </p>
                <div className="flex flex-wrap gap-2">
                  {artifact.opportunities!.acceptedTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 bg-ink text-paper text-xs font-mono rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                {artifact.opportunities?.industries && (
                  <p className="text-xs text-fog mt-2">
                    Industries: {artifact.opportunities.industries.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MeasureFrame>
  );
}

function RoadmapSection({ roadmap }: { roadmap: NonNullable<Exhibit["roadmap"]> }) {
  const completedCount = roadmap.items.filter((i) => i.done).length;
  const totalCount = roadmap.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1.5 bg-hair rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-ink rounded-full"
          />
        </div>
        <span className="font-mono text-xs text-fog">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        {roadmap.items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-start gap-3"
          >
            <span
              className={`mt-1 w-4 h-4 flex items-center justify-center rounded border ${
                item.done
                  ? "bg-ink border-ink text-paper"
                  : "bg-paper border-hair"
              }`}
            >
              {item.done && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className={item.done ? "text-ink" : "text-fog"}>{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ExhibitPage() {
  const params = useParams();
  const { handleSessionExpired, handleSessionInvalid, handleNetworkError } = useSessionErrors();
  const slug = params.slug as string;

  const exhibit = useMemo(() => {
    return exhibits.find((e) => e.slug === slug);
  }, [slug]);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/gate/status", { credentials: "include" });
        if (!res.ok) {
          handleSessionInvalid();
        }
      } catch {
        handleNetworkError();
      }
    };
    verifySession();
  }, [handleSessionInvalid, handleNetworkError]);

  if (!exhibit) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Heartbeat client for session management */}
      <HeartbeatClient enabled onExpired={handleSessionExpired} />

      {/* Header */}
      <header className="border-b border-hair bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/library"
              className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
            >
              The Atrium
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-fog">
              <Link href="/library" className="hover:text-ink transition-colors">
                Exhibits
              </Link>
              <Link href="/library/archive" className="hover:text-ink transition-colors">
                Archive
              </Link>
              <Link href="/library/about" className="hover:text-ink transition-colors">
                About
              </Link>
              <Link href="/library/contact" className="hover:text-ink transition-colors">
                Contact
              </Link>
            </nav>
          </div>
          <Link
            href="/gate"
            className="px-4 py-2 text-sm border border-hair rounded-lg hover:bg-ink/5 transition-colors"
          >
            Exit Gallery
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Exhibit Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-fog uppercase tracking-widest">
              {exhibit.code}
            </span>
            <span className="text-fog">·</span>
            <span className="font-mono text-xs text-fog">{exhibit.version}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-medium tracking-tight mb-3">
                {exhibit.title}
              </h1>
              <p className="text-lg text-fog leading-relaxed max-w-2xl">
                {exhibit.thesis}
              </p>
            </div>
            <StatusBadge status={exhibit.status} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {exhibit.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-hair text-ink text-sm font-mono rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Placard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Placard
            what={exhibit.placard.what}
            why={exhibit.placard.why}
            approach={exhibit.placard.approach}
          />
        </motion.section>

        {/* Exhibit Auction (if configured) */}
        {exhibit.auction && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
              Auction
            </h2>
            <ExhibitAuctionPanel exhibit={exhibit} />
          </motion.section>
        )}

        {/* Roadmap */}
        {exhibit.roadmap && exhibit.roadmap.items.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
              Roadmap
            </h2>
            <MeasureFrame
              meta="MILESTONES"
              showMeta
              className="p-6 bg-paper shadow-museum rounded-2xl"
            >
              <RoadmapSection roadmap={exhibit.roadmap} />
            </MeasureFrame>
          </motion.section>
        )}

        {/* Artifacts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Artifacts ({exhibit.artifacts.length})
          </h2>
          <div className="space-y-8">
            {exhibit.artifacts.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <ArtifactCard artifact={artifact} exhibitSlug={exhibit.slug} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Collaboration CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <MeasureFrame
            meta="COLLABORATION"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl text-center"
          >
            <h3 className="font-display text-lg mb-3">
              Interested in this exhibit?
            </h3>
            <p className="text-fog text-sm mb-6 max-w-md mx-auto">
              The artifacts in this collection may be available for acquisition, 
              collaboration, or consultation.
            </p>
            <Link
              href="/library/contact"
              className="inline-block px-6 py-3 bg-ink text-paper rounded-lg hover:bg-ink/80 transition-colors"
            >
              Start a Conversation
            </Link>
          </MeasureFrame>
        </motion.section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-hair text-center"
        >
          <Link
            href="/library"
            className="text-sm text-fog hover:text-ink transition-colors"
          >
            ← Back to Exhibits
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hair mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-fog">
              PROJECT ZYGA — Event Horizon Gallery
            </p>
            <div className="flex items-center gap-6 text-xs text-fog font-mono">
              <Link href="/library/about" className="hover:text-ink transition-colors">
                About
              </Link>
              <Link href="/library/contact" className="hover:text-ink transition-colors">
                Contact
              </Link>
              <Link href="/library/archive" className="hover:text-ink transition-colors">
                Archive
              </Link>
              <a
                href="mailto:zygazyga157@gmail.com"
                className="hover:text-ink transition-colors"
              >
                zygazyga157@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
