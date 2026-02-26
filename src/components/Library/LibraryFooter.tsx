import Link from "next/link";

/**
 * Shared footer for all library pages
 * Provides consistent branding and navigation
 */
export function LibraryFooter() {
  return (
    <footer className="border-t border-hair py-8 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fog">
            PROJECT ZYGA — Event Horizon Gallery
          </p>
          <div className="flex items-center gap-6 text-sm text-fog">
            <Link
              href="/library/about"
              className="hover:text-ink transition-colors"
            >
              About
            </Link>
            <Link
              href="/library/contact"
              className="hover:text-ink transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/library/archive"
              className="hover:text-ink transition-colors"
            >
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
  );
}
