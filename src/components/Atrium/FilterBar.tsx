"use client";

import { useState, useMemo } from "react";
import type { ExhibitStatus } from "@/domain/gallery";

interface FilterBarProps {
  allTags: string[];
  allStatuses: ExhibitStatus[];
  selectedTags: string[];
  selectedStatus: ExhibitStatus | null;
  searchQuery: string;
  onTagsChange: (tags: string[]) => void;
  onStatusChange: (status: ExhibitStatus | null) => void;
  onSearchChange: (query: string) => void;
}

/**
 * Filter bar for Atrium exhibits
 * Includes search, status filter, and tag filter
 */
export function FilterBar({
  allTags,
  allStatuses,
  selectedTags,
  selectedStatus,
  searchQuery,
  onTagsChange,
  onStatusChange,
  onSearchChange,
}: FilterBarProps) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
    onStatusChange(null);
    onSearchChange("");
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedStatus !== null || searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search exhibits..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-fog uppercase tracking-plaque">Status:</span>
        <button
          onClick={() => onStatusChange(null)}
          className={`px-3 py-1 text-xs font-mono rounded-full transition-colors ${
            selectedStatus === null
              ? "bg-ink text-paper"
              : "bg-hair text-ink hover:bg-ink/10"
          }`}
        >
          All
        </button>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`px-3 py-1 text-xs font-mono rounded-full transition-colors ${
              selectedStatus === status
                ? "bg-ink text-paper"
                : "bg-hair text-ink hover:bg-ink/10"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tags filter */}
      <div className="space-y-2">
        <button
          onClick={() => setIsTagsExpanded(!isTagsExpanded)}
          className="flex items-center gap-2 text-xs font-mono text-fog uppercase tracking-plaque hover:text-ink transition-colors"
        >
          <span>Tags</span>
          <svg
            className={`w-3 h-3 transition-transform ${isTagsExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {selectedTags.length > 0 && (
            <span className="px-1.5 py-0.5 bg-ink text-paper rounded text-xs">
              {selectedTags.length}
            </span>
          )}
        </button>

        {isTagsExpanded && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
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
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs font-mono text-fog underline hover:text-ink transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
