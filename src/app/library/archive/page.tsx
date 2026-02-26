"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MeasureFrame } from "@/components/MeasureFrame";
import { StatusBadge } from "@/components/StatusBadge";
import { HeartbeatClient } from "@/components/Gate";
import { useSessionErrors } from "@/hooks/useSessionErrors";
import { exhibits } from "@/content";
import type { Artifact, Exhibit } from "@/domain/gallery";

type FlatArtifact = Artifact & {
  exhibitSlug: string;
  exhibitTitle: string;
  exhibitCode: string;
};

type SortOption = "recent" | "name" | "exhibit";

export default function ArchivePage() {
  const { handleSessionExpired, handleSessionInvalid, handleNetworkError } = useSessionErrors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExhibit, setSelectedExhibit] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

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

  // Flatten all artifacts across exhibits
  const allArtifacts: FlatArtifact[] = useMemo(() => {
    const artifacts: FlatArtifact[] = [];
    exhibits.forEach((exhibit) => {
      exhibit.artifacts.forEach((artifact) => {
        artifacts.push({
          ...artifact,
          exhibitSlug: exhibit.slug,
          exhibitTitle: exhibit.title,
          exhibitCode: exhibit.code,
        });
      });
    });
    return artifacts;
  }, []);

  // Get all unique tags from artifacts
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allArtifacts.forEach((a) => a.stack.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allArtifacts]);

  // Filter and sort artifacts
  const filteredArtifacts = useMemo(() => {
    let result = allArtifacts.filter((artifact) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = artifact.name.toLowerCase().includes(query);
        const matchesDesc = artifact.description.toLowerCase().includes(query);
        const matchesStack = artifact.stack.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesStack) return false;
      }

      // Exhibit filter
      if (selectedExhibit && artifact.exhibitSlug !== selectedExhibit) return false;

      // Tags filter
      if (selectedTags.length > 0) {
        const hasTags = selectedTags.every((tag) => artifact.stack.includes(tag));
        if (!hasTags) return false;
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "exhibit":
        result.sort((a, b) => a.exhibitCode.localeCompare(b.exhibitCode));
        break;
    }

    return result;
  }, [allArtifacts, searchQuery, selectedExhibit, selectedTags, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedExhibit(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedExhibit || selectedTags.length > 0;

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
              <span className="text-ink font-medium">Archive</span>
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
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-fog mb-2">
            Complete Collection
          </p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">Archive</h1>
          <p className="text-lg text-fog leading-relaxed max-w-2xl">
            All artifacts across every exhibit, searchable and sortable. 
            A comprehensive index of projects, experiments, and systems.
          </p>
        </motion.div>

        {/* Filter & Sort Controls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-hair rounded-lg text-ink placeholder:text-fog font-mono text-sm focus:outline-none focus:border-ink transition-colors"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-fog"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Exhibit filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-fog uppercase">Exhibit:</span>
              <select
                value={selectedExhibit || ""}
                onChange={(e) => setSelectedExhibit(e.target.value || null)}
                className="px-3 py-1.5 bg-paper border border-hair rounded-lg text-sm focus:outline-none focus:border-ink"
              >
                <option value="">All</option>
                {exhibits.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.code} — {e.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-fog uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-paper border border-hair rounded-lg text-sm focus:outline-none focus:border-ink"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A–Z</option>
                <option value="exhibit">By Exhibit</option>
              </select>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-fog hover:text-ink underline underline-offset-4 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Tag filter pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-ink text-paper"
                      : "bg-hair text-ink hover:bg-ink/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </motion.section>

        {/* Results count */}
        <div className="mb-6">
          <p className="font-mono text-xs text-fog uppercase tracking-widest">
            {filteredArtifacts.length} Artifact{filteredArtifacts.length !== 1 ? "s" : ""} Found
          </p>
        </div>

        {/* Artifacts List */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredArtifacts.length > 0 ? (
            <div className="space-y-8">
              {filteredArtifacts.map((artifact, index) => (
                <motion.div
                  key={`${artifact.exhibitSlug}-${artifact.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * Math.min(index, 10) }}
                >
                  <Link href={`/library/exhibits/${artifact.exhibitSlug}#${artifact.id}`}>
                    <MeasureFrame
                      meta={`${artifact.exhibitCode} / ${artifact.id} / ${artifact.updatedAt}`}
                      showMeta
                      className="p-6 bg-paper shadow-museum rounded-2xl hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium">{artifact.name}</h3>
                            <StatusBadge status={artifact.status as any} />
                          </div>
                          <p className="text-fog text-sm leading-relaxed line-clamp-2">
                            {artifact.description}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {artifact.stack.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-hair text-ink text-xs font-mono rounded"
                              >
                                {tech}
                              </span>
                            ))}
                            {artifact.stack.length > 5 && (
                              <span className="text-xs text-fog">
                                +{artifact.stack.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-xs text-fog">
                            {artifact.exhibitTitle}
                          </p>
                          {artifact.links && artifact.links.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 justify-end">
                              {artifact.links.slice(0, 2).map((link) => (
                                <span
                                  key={link.href}
                                  className="text-xs text-fog underline underline-offset-2"
                                >
                                  {link.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </MeasureFrame>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <MeasureFrame
              meta="NO RESULTS"
              showMeta
              className="max-w-md mx-auto p-8 bg-paper shadow-museum rounded-2xl text-center"
            >
              <p className="text-fog mb-4">No artifacts match your current filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm underline underline-offset-4 hover:text-ink/70 transition-colors"
              >
                Clear filters
              </button>
            </MeasureFrame>
          )}
        </motion.section>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
