/**
 * Admin Layout
 * Protected layout for admin dashboard - requires admin session
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce } from "@/lib/gate/hashing";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

// Admin routes are noindex zones
export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gate_pass")?.value;
  
  if (!token) return null;
  
  try {
    const payload = await unsealToken(token);
    if (!payload) return null;
    
    const tokenHash = hashNonce(payload.nonce);
    const session = await prisma.gateSession.findFirst({
      where: {
        tokenHash,
        status: "ACTIVE",
        isAdmin: true,
      },
    });
    
    return session;
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/gate?reason=admin_required");
  }
  
  return (
    <div className="min-h-screen bg-paper">
      {/* Admin Header */}
      <header className="border-b border-hair bg-ink text-paper">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-mono text-sm uppercase tracking-wider hover:opacity-80">
              Admin Dashboard
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/admin/auctions" 
                className="text-sm text-paper/70 hover:text-paper transition-colors"
              >
                Auctions
              </Link>
              <Link 
                href="/admin/bids" 
                className="text-sm text-paper/70 hover:text-paper transition-colors"
              >
                Bids
              </Link>
              <Link 
                href="/admin/emails" 
                className="text-sm text-paper/70 hover:text-paper transition-colors"
              >
                Emails
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-paper/70">
              {session.displayName}
            </span>
            <Link 
              href="/library" 
              className="text-sm text-paper/70 hover:text-paper transition-colors"
            >
              Exit Admin
            </Link>
          </div>
        </div>
      </header>
      
      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
