"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StateDocument, DocumentSection } from "@/content/docs/sound-sync";

export interface DocumentReaderProps {
  document: StateDocument;
}

/**
 * DocumentReader - Museum-styled scrollable document panel with section navigation
 * Features: table of contents, smooth scrolling, responsive design
 */
export function DocumentReader({ document }: DocumentReaderProps) {
  const [activeSection, setActiveSection] = useState<string>(
    document.sections[0]?.id ?? ""
  );
  const [showToc, setShowToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && contentRef.current) {
      const containerTop = contentRef.current.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const offset = elementTop - containerTop;
      
      contentRef.current.scrollTo({
        top: contentRef.current.scrollTop + offset - 16,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
      setShowToc(false);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      let currentSection = document.sections[0]?.id ?? "";

      for (const section of document.sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const elementRect = element.getBoundingClientRect();
          // Check if section is near top of container
          if (elementRect.top <= containerRect.top + 100) {
            currentSection = section.id;
          }
        }
      }

      setActiveSection(currentSection);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [document.sections]);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-paper shadow-museum">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hair px-6 py-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-fog">
            {document.subtitle}
          </span>
          <h3 className="mt-1 font-mono text-sm font-medium text-ink">
            {document.title}
          </h3>
        </div>
        
        {/* Mobile TOC Toggle */}
        <button
          onClick={() => setShowToc(!showToc)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs text-fog transition-colors hover:bg-ink/5 hover:text-ink md:hidden"
          aria-label="Toggle table of contents"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          Sections
        </button>
      </div>

      {/* Mobile TOC Dropdown */}
      <AnimatePresence>
        {showToc && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-hair md:hidden"
          >
            <nav className="p-4">
              <ul className="space-y-1">
                {document.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors ${
                        activeSection === section.id
                          ? "bg-ink/5 text-ink"
                          : "text-fog hover:bg-ink/5 hover:text-ink"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar TOC */}
        <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-hair p-4 md:block">
          <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-fog">
            Contents
          </span>
          <nav>
            <ul className="space-y-1">
              {document.sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors ${
                      activeSection === section.id
                        ? "bg-ink/5 text-ink font-medium"
                        : "text-fog hover:bg-ink/5 hover:text-ink"
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 md:p-8"
        >
          <div className="space-y-8">
            {document.sections.map((section: DocumentSection) => (
              <section
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                id={section.id}
              >
                <h4 className="mb-4 font-mono text-xs font-medium uppercase tracking-widest text-ink">
                  {section.title}
                </h4>
                <div className="space-y-3">
                  {section.content.map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="font-mono text-sm leading-relaxed text-fog"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Version footer */}
          <div className="mt-12 border-t border-hair pt-4">
            <span className="font-mono text-xs text-fog/60">
              Documentation v{document.version}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
