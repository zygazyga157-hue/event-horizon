"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MeasureFrame } from "@/components/MeasureFrame";
import { HeartbeatClient } from "@/components/Gate";
import { FloatingDock } from "@/components/Support";
import { useSessionErrors } from "@/hooks/useSessionErrors";
import { aboutCopy, siteMeta, SUPPORT } from "@/content";

export default function AboutPage() {
  const { handleSessionExpired, handleSessionInvalid, handleNetworkError } = useSessionErrors();

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
              <span className="text-ink font-medium">About</span>
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
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-fog mb-2">
            {aboutCopy.metaLine}
          </p>
          <h1 className="text-4xl font-medium tracking-tight mb-4">
            {aboutCopy.pageTitle}
          </h1>
          <p className="text-lg text-fog leading-relaxed max-w-2xl">
            {aboutCopy.subheading}
          </p>
        </motion.div>

        {/* Hero Bio */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <MeasureFrame
            meta="BIO / BACKGROUND"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl"
          >
            <p className="text-ink leading-relaxed whitespace-pre-line text-lg">
              {aboutCopy.heroText}
            </p>
          </MeasureFrame>
        </motion.section>

        {/* Placard - What / Why / Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Curatorial Placard
          </h2>
          <MeasureFrame
            meta="PLACARD"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl"
          >
            <div className="space-y-8">
              {/* What */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-plaque text-fog mb-3">
                  What
                </h3>
                <p className="text-ink leading-relaxed">{aboutCopy.placard.what}</p>
              </div>

              {/* Why */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-plaque text-fog mb-3">
                  Why
                </h3>
                <p className="text-ink leading-relaxed">{aboutCopy.placard.why}</p>
              </div>

              {/* Approach */}
              <div>
                <h3 className="font-mono text-xs uppercase tracking-plaque text-fog mb-3">
                  Approach
                </h3>
                <ul className="space-y-2">
                  {aboutCopy.placard.approach.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-ink">
                      <span className="mt-2 w-1.5 h-1.5 bg-ink rounded-full shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MeasureFrame>
        </motion.section>

        {/* Core Specialties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Core Specialties
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aboutCopy.coreSpecialties.map((specialty, index) => (
              <motion.div
                key={specialty}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.03 }}
                className="px-4 py-3 border border-hair rounded-lg text-ink"
              >
                {specialty}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Languages & Frameworks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Languages & Frameworks
          </h2>
          <MeasureFrame
            meta="TECH STACK"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl"
          >
            <div className="space-y-6">
              {aboutCopy.languages.map((lang) => (
                <div key={lang.name}>
                  <h3 className="font-medium mb-3">{lang.name}</h3>
                  {lang.frameworks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lang.frameworks.map((fw) => (
                        <span
                          key={fw}
                          className="px-3 py-1 bg-hair text-ink text-sm font-mono rounded-full"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </MeasureFrame>
        </motion.section>

        {/* Tools */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Tooling & Platforms
          </h2>
          <div className="flex flex-wrap gap-3">
            {aboutCopy.tools.map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 border border-hair text-ink text-sm rounded-lg"
              >
                {tool}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Compatibility */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Platform Compatibility
          </h2>
          <div className="flex flex-wrap gap-3">
            {aboutCopy.compatibility.map((platform) => (
              <span
                key={platform}
                className="px-4 py-2 bg-hair text-ink text-sm font-mono rounded-full"
              >
                {platform}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-mono text-xs uppercase tracking-widest text-fog mb-6">
            Timeline
          </h2>
          <div className="border-l-2 border-hair pl-6 space-y-6">
            {aboutCopy.timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="relative"
              >
                <span className="absolute -left-[33px] w-4 h-4 bg-paper border-2 border-ink rounded-full" />
                <p className="font-mono text-sm text-ink mb-1">{item.year}</p>
                <p className="text-fog">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <MeasureFrame
            meta="NEXT STEPS"
            showMeta
            className="p-8 bg-paper shadow-museum rounded-2xl"
          >
            <div className="text-center space-y-6">
              <p className="font-mono text-xs text-fog">{siteMeta.keynote}</p>
              <h3 className="font-display text-xl">
                Ready to explore?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/library"
                  className="px-6 py-3 bg-ink text-paper rounded-lg hover:bg-ink/80 transition-colors"
                >
                  Enter the Atrium
                </Link>
                <Link
                  href="/library/contact"
                  className="px-6 py-3 border border-hair rounded-lg hover:bg-ink/5 transition-colors"
                >
                  Contact the Curator
                </Link>
                <Link
                  href="/library/archive"
                  className="px-6 py-3 border border-hair rounded-lg hover:bg-ink/5 transition-colors"
                >
                  Explore the Archive
                </Link>
              </div>
            </div>
          </MeasureFrame>
        </motion.section>

        {/* Footer motif */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12 pt-8 border-t border-hair text-center"
        >
          <p className="font-mono text-xs text-fog">{siteMeta.esoteric157}</p>
        </motion.div>
      </main>

      {/* Footer */}
      {/* Floating Support Dock */}
      <FloatingDock
        paypalDonateUrl={SUPPORT.paypalDonateUrl}
        btcAddress={SUPPORT.btcAddress}
        bchAddress={SUPPORT.bchAddress}
      />

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
