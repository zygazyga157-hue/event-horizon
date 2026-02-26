/**
 * Admin Dashboard Home
 * Overview of auction activity and quick actions
 */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { exhibits } from "@/content/exhibits";

async function getStats() {
  const [auctionCount, bidCount, activeSessions, pendingEmails] = await Promise.all([
    prisma.auction.count(),
    prisma.bid.count(),
    prisma.gateSession.count({ where: { status: "ACTIVE" } }),
    prisma.emailOutbox.count({ where: { status: "PENDING" } }),
  ]);
  
  const recentBids = await prisma.bid.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      auction: {
        select: { exhibitSlug: true },
      },
    },
  });
  
  return {
    auctionCount,
    bidCount,
    activeSessions,
    pendingEmails,
    recentBids,
    exhibitCount: exhibits.length,
    exhibitsWithAuction: exhibits.filter(e => e.auction).length,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-ink">Dashboard</h1>
        <p className="text-fog mt-1">Manage auctions, bids, and notifications</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Active Auctions" 
          value={stats.auctionCount.toString()} 
          href="/admin/auctions"
        />
        <StatCard 
          label="Total Bids" 
          value={stats.bidCount.toString()} 
          href="/admin/bids"
        />
        <StatCard 
          label="Active Sessions" 
          value={stats.activeSessions.toString()} 
        />
        <StatCard 
          label="Pending Emails" 
          value={stats.pendingEmails.toString()} 
          href="/admin/emails"
          alert={stats.pendingEmails > 0}
        />
      </div>
      
      {/* Exhibits Overview */}
      <div className="border border-hair rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-ink">Exhibits</h2>
          <span className="text-sm text-fog">
            {stats.exhibitsWithAuction} of {stats.exhibitCount} with auctions
          </span>
        </div>
        <div className="space-y-3">
          {exhibits.map((exhibit) => (
            <div 
              key={exhibit.slug}
              className="flex items-center justify-between p-3 rounded-lg bg-hair/30"
            >
              <div>
                <div className="font-medium text-ink">{exhibit.title}</div>
                <div className="text-sm text-fog">{exhibit.code}</div>
              </div>
              <div className="flex items-center gap-3">
                {exhibit.auction ? (
                  <span className={`px-2 py-1 text-xs font-mono rounded ${
                    exhibit.auction.status === "LIVE" 
                      ? "bg-ink text-paper" 
                      : "bg-hair text-fog"
                  }`}>
                    {exhibit.auction.status}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-mono rounded bg-hair text-fog">
                    No Auction
                  </span>
                )}
                <Link
                  href={`/admin/auctions/${exhibit.slug}`}
                  className="text-sm text-ink hover:underline"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Bids */}
      <div className="border border-hair rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-ink">Recent Bids</h2>
          <Link href="/admin/bids" className="text-sm text-fog hover:text-ink">
            View All →
          </Link>
        </div>
        {stats.recentBids.length === 0 ? (
          <p className="text-fog text-sm">No bids yet</p>
        ) : (
          <div className="space-y-2">
            {stats.recentBids.map((bid) => (
              <div 
                key={bid.id}
                className="flex items-center justify-between p-3 rounded-lg bg-hair/30"
              >
                <div>
                  <div className="font-medium text-ink">{bid.bidderName}</div>
                  <div className="text-sm text-fog">{bid.auction.exhibitSlug}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-ink">
                    ${(bid.amount / 100).toLocaleString()}
                  </div>
                  <div className="text-xs text-fog">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  href, 
  alert 
}: { 
  label: string; 
  value: string; 
  href?: string; 
  alert?: boolean;
}) {
  const content = (
    <div className={`p-4 rounded-xl border ${alert ? "border-ink bg-ink/5" : "border-hair"}`}>
      <div className="text-sm text-fog mb-1">{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </div>
  );
  
  if (href) {
    return (
      <Link href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  
  return content;
}
