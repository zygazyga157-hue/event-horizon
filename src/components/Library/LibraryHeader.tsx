"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OccupancyBadge } from "@/components/OccupancyBadge";

interface LibraryHeaderProps {
  occupancy?: { activeCount: number; capacity: number };
  onExit?: () => void;
}

const navLinks = [
  { href: "/library", label: "Exhibits" },
  { href: "/library/archive", label: "Archive" },
  { href: "/library/about", label: "About" },
  { href: "/library/contact", label: "Contact" },
];

/**
 * Shared header for all library pages
 * Provides consistent navigation and occupancy display
 */
export function LibraryHeader({ occupancy, onExit }: LibraryHeaderProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/library") {
      return pathname === "/library" || pathname?.startsWith("/library/exhibits");
    }
    return pathname === href;
  };

  return (
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive(link.href)
                    ? "text-ink font-medium"
                    : "hover:text-ink transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {occupancy && (
            <OccupancyBadge
              activeCount={occupancy.activeCount}
              capacity={occupancy.capacity}
            />
          )}
        </div>
        {onExit ? (
          <button
            onClick={onExit}
            className="px-4 py-2 text-sm border border-hair rounded-lg hover:bg-ink/5 transition-colors"
          >
            Exit Gallery
          </button>
        ) : (
          <Link
            href="/gate"
            className="px-4 py-2 text-sm border border-hair rounded-lg hover:bg-ink/5 transition-colors"
          >
            Exit Gallery
          </Link>
        )}
      </div>
    </header>
  );
}
