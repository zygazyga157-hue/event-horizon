/**
 * Admin Auction Detail Page
 * Manage individual exhibit auction
 */
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { exhibits } from "@/content/exhibits";
import Link from "next/link";
import { AuctionControls } from "./AuctionControls";
import type { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type AuctionWithRelations = Prisma.AuctionGetPayload<{
  include: {
    bids: true;
    states: true;
    _count: { select: { bids: true } };
  };
}>;

async function getAuctionData(slug: string) {
  const exhibit = exhibits.find(e => e.slug === slug);
  if (!exhibit) return null;
  
  const auction = await prisma.auction.findUnique({
    where: { exhibitSlug: slug },
    include: {
      bids: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      states: {
        orderBy: { capturedAt: "desc" },
        take: 10,
      },
      _count: {
        select: { bids: true },
      },
    },
  }) as AuctionWithRelations | null;
  
  return { exhibit, auction };
}

export default async function AdminAuctionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getAuctionData(slug);
  
  if (!data) {
    notFound();
  }
  
  const { exhibit, auction } = data;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link 
            href="/admin/auctions" 
            className="text-sm text-fog hover:text-ink mb-2 inline-block"
          >
            ← Back to Auctions
          </Link>
          <h1 className="text-3xl font-medium tracking-tight text-ink">{exhibit.title}</h1>
          <p className="text-fog mt-1">{exhibit.code} — Auction Management</p>
        </div>
        <AuctionControls 
          exhibitSlug={slug}
          auction={auction ? {
            id: auction.id,
            status: auction.status,
            currentBid: auction.currentBid,
            bidCount: auction._count.bids,
          } : null}
          staticAuction={exhibit.auction}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auction Status Card */}
          <div className="border border-hair rounded-xl p-6">
            <h2 className="text-lg font-medium text-ink mb-4">Auction Status</h2>
            {auction ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-fog font-mono uppercase mb-1">Status</div>
                  <StatusBadge status={auction.status} />
                </div>
                <div>
                  <div className="text-xs text-fog font-mono uppercase mb-1">Current Bid</div>
                  <div className="text-2xl font-bold text-ink">
                    {auction.currentBid 
                      ? `$${(auction.currentBid / 100).toLocaleString()}`
                      : `$${(auction.openingBid / 100).toLocaleString()} (opening)`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-xs text-fog font-mono uppercase mb-1">Total Bids</div>
                  <div className="text-xl font-mono text-ink">{auction._count.bids}</div>
                </div>
                <div>
                  <div className="text-xs text-fog font-mono uppercase mb-1">Ends At</div>
                  <div className="text-sm text-ink">
                    {auction.endsAt 
                      ? new Date(auction.endsAt).toLocaleString()
                      : "No end date"
                    }
                  </div>
                </div>
                {auction.winnerId && (
                  <>
                    <div>
                      <div className="text-xs text-fog font-mono uppercase mb-1">Winner</div>
                      <div className="text-sm font-medium text-ink">{auction.winnerEmail || auction.winnerId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-fog font-mono uppercase mb-1">Invoice Status</div>
                      <div className="text-sm text-ink">
                        {auction.paidAt ? "Paid ✓" : auction.invoiceSentAt ? "Invoice Sent" : "Pending Invoice"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : exhibit.auction ? (
              <div className="p-4 bg-hair/30 rounded-lg">
                <p className="text-fog text-sm mb-2">
                  This exhibit has auction configuration but no database record.
                </p>
                <p className="text-fog text-sm">
                  Opening Bid: <span className="font-mono">${exhibit.auction.openingBid}</span>
                </p>
              </div>
            ) : (
              <p className="text-fog">No auction configured for this exhibit.</p>
            )}
          </div>
          
          {/* Bid History */}
          <div className="border border-hair rounded-xl p-6">
            <h2 className="text-lg font-medium text-ink mb-4">Bid History</h2>
            {auction && auction.bids.length > 0 ? (
              <div className="space-y-2">
                {auction.bids.map((bid, index) => (
                  <div 
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? "bg-ink text-paper" : "bg-hair/30"
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${index === 0 ? "text-paper" : "text-ink"}`}>
                        {bid.bidderName}
                        {index === 0 && " — Leading"}
                      </div>
                      <div className={`text-sm ${index === 0 ? "text-paper/70" : "text-fog"}`}>
                        {bid.bidderEmail || "Anonymous"} • {bid.bidType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${index === 0 ? "text-paper" : "text-ink"}`}>
                        ${(bid.amount / 100).toLocaleString()}
                      </div>
                      <div className={`text-xs ${index === 0 ? "text-paper/70" : "text-fog"}`}>
                        {new Date(bid.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-fog text-sm">No bids yet</p>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Exhibit Info */}
          <div className="border border-hair rounded-xl p-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-fog mb-3">Exhibit Info</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-fog">Status</div>
                <div className="text-ink">{exhibit.status}</div>
              </div>
              <div>
                <div className="text-xs text-fog">Version</div>
                <div className="text-ink">{exhibit.version}</div>
              </div>
              <div>
                <div className="text-xs text-fog">Artifacts</div>
                <div className="text-ink">{exhibit.artifacts.length}</div>
              </div>
            </div>
          </div>
          
          {/* State History */}
          {auction && auction.states.length > 0 && (
            <div className="border border-hair rounded-xl p-6">
              <h3 className="text-sm font-mono uppercase tracking-wider text-fog mb-3">State History</h3>
              <div className="space-y-2">
                {auction.states.map((state) => (
                  <div key={state.id} className="text-xs p-2 bg-hair/30 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-ink">{state.status}</span>
                      <span className="text-fog">
                        {new Date(state.capturedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {state.currentBid && (
                      <div className="text-fog">
                        Bid: ${(state.currentBid / 100).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-hair text-fog",
    SCHEDULED: "bg-hair text-ink",
    LIVE: "bg-ink text-paper",
    PAUSED: "bg-hair text-ink",
    ENDED: "bg-hair/50 text-fog",
  };
  
  return (
    <span className={`inline-block px-2 py-1 text-xs font-mono uppercase rounded ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
}
