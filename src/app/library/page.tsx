"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MeasureFrame, OccupancyBadge } from "@/components";
import { HeartbeatClient } from "@/components/Gate";
import { ExhibitCard, AvailabilityStrip, FilterBar } from "@/components/Atrium";
import { useSessionErrors } from "@/hooks/useSessionErrors";
import { exhibits } from "@/content";
import type { ExhibitStatus } from "@/domain/gallery";

export default function LibraryPage() {
  const router = useRouter();
  const { handleSessionExpired, handleSessionInvalid, handleNetworkError } = useSessionErrors();
  const [occupancy, setOccupancy] = useState({ activeCount: 0, capacity: 200 });
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ExhibitStatus | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Derived data
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    exhibits.forEach((e) => e.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const allStatuses = useMemo(() => {
    const statuses = new Set<ExhibitStatus>();
    exhibits.forEach((e) => statuses.add(e.status));
    return Array.from(statuses);
  }, []);

  // Filtered exhibits
  const filteredExhibits = useMemo(() => {
    return exhibits.filter((exhibit) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exhibit.title.toLowerCase().includes(query);
        const matchesTags = exhibit.tags.some((t) => t.toLowerCase().includes(query));
        const matchesThesis = exhibit.thesis.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTags && !matchesThesis) return false;
      }

      // Status filter
      if (selectedStatus && exhibit.status !== selectedStatus) return false;

      // Tags filter (must have ALL selected tags)
      if (selectedTags.length > 0) {
        const hasTags = selectedTags.every((tag) => exhibit.tags.includes(tag));
        if (!hasTags) return false;
      }

      return true;
    });
  }, [searchQuery, selectedStatus, selectedTags]);

  const handleExit = async () => {
    try {
      await fetch("/api/gate/exit", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors
    }
    router.push("/gate");
  };

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/gate/status", { credentials: "include" });
        const data = await res.json();

        if (data.yourStatus !== "ACTIVE") {
          handleSessionInvalid();
          return;
        }

        setOccupancy({
          activeCount: data.activeCount ?? 0,
          capacity: data.capacity ?? 200,
        });
      } catch {
        handleNetworkError();
      }
    };

    verifySession();
  }, [handleSessionInvalid, handleNetworkError]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus(null);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedStatus || selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Heartbeat client for session management */}
      <HeartbeatClient
        enabled
        onOccupancyChange={setOccupancy}
        onExpired={handleSessionExpired}
      />

      {/* Header */}
      <header className="border-b border-hair bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-display text-xl tracking-tight">The Atrium</h1>
            <nav className="hidden md:flex items-center gap-4 text-sm text-fog">
              <span className="text-ink font-medium">Exhibits</span>
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
            <OccupancyBadge
              activeCount={occupancy.activeCount}
              capacity={occupancy.capacity}
            />
          </div>
          <button
            onClick={handleExit}
            className="px-4 py-2 text-sm border border-hair rounded-lg hover:bg-ink/5 transition-colors"
          >
            Exit Gallery
          </button>
        </div>
      </header>

      {/* Availability Strip */}
      <AvailabilityStrip
        status="selective"
        focus="Systems engineering & full-stack architecture"
        lastUpdate="2026-02"
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <MeasureFrame
            meta="CURATORIAL NOTE"
            showMeta
            className="max-w-3xl p-8 bg-paper shadow-museum rounded-2xl"
          >
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                Welcome to the Atrium. This gallery presents a curated selection of 
                systems, architectures, and engineering endeavors—each exhibited as 
                a complete narrative of problem, process, and proof.
              </p>
              <p className="text-fog text-sm">
                Navigate through exhibits to explore the artifacts within. Some works 
                are available for acquisition or collaboration through the auction mechanism.
              </p>
            </div>
          </MeasureFrame>
        </motion.section>

        {/* Filter Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            allStatuses={allStatuses}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            allTags={allTags}
          />
        </motion.section>

        {/* Exhibits Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs text-fog uppercase tracking-widest">
              {filteredExhibits.length} Exhibit{filteredExhibits.length !== 1 ? "s" : ""} on Display
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-fog hover:text-ink transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {filteredExhibits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExhibits.map((exhibit, index) => (
                <motion.div
                  key={exhibit.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <ExhibitCard exhibit={exhibit} />
                </motion.div>
              ))}
            </div>
          ) : (
            <MeasureFrame
              meta="NO RESULTS"
              showMeta
              className="max-w-md mx-auto p-8 bg-paper shadow-museum rounded-2xl"
            >
              <div className="text-center">
                <p className="text-fog mb-4">
                  No exhibits match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm underline underline-offset-4 hover:text-ink/70 transition-colors"
                >
                  Clear filters to view all exhibits
                </button>
              </div>
            </MeasureFrame>
          )}
        </motion.section>

        {/* Footer CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-12 border-t border-hair"
        >
          <MeasureFrame
            meta="COLLABORATION"
            showMeta
            className="max-w-2xl mx-auto p-8 bg-paper shadow-museum rounded-2xl"
          >
            <div className="text-center space-y-4">
              <h3 className="font-display text-lg">Interested in Working Together?</h3>
              <p className="text-fog text-sm leading-relaxed">
                Each exhibit contains artifacts that may be available for acquisition, 
                collaboration, or consultation. Browse the works and explore the 
                auction mechanisms within.
              </p>
              <div className="pt-4">
                <a
                  href="mailto:zygazyga157@gmail.com"
                  className="inline-block px-6 py-3 border border-hair rounded-lg hover:bg-ink hover:text-paper transition-colors"
                >
                  Inquire About Collaboration
                </a>
              </div>
            </div>
          </MeasureFrame>
        </motion.section>
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
