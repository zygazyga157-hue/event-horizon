/**
 * Admin Auctions List Page
 * Overview of all auctions with management controls
 */
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { exhibits } from "@/content/exhibits";

async function getAuctions() {
  const auctions = await prisma.auction.findMany({
    include: {
      _count: {
        select: { bids: true },
      },
      bids: {
        where: { isWinning: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
  
  return auctions;
}

export default async function AdminAuctionsPage() {
  const auctions = await getAuctions();
  
  // Map auctions to exhibits
  const exhibitAuctions = exhibits.map((exhibit) => {
    const dbAuction = auctions.find(a => a.exhibitSlug === exhibit.slug);
    return {
      exhibit,
      auction: dbAuction,
      staticAuction: exhibit.auction,
    };
  });
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-ink">Auctions</h1>
          <p className="text-fog mt-1">Manage exhibit auctions</p>
        </div>
      </div>
      
      {/* Auctions Table */}
      <div className="border border-hair rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-hair/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-fog">
                Exhibit
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-fog">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-fog">
                Current Bid
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-fog">
                Bids
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-fog">
                Ends At
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-fog">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {exhibitAuctions.map(({ exhibit, auction, staticAuction }) => (
              <tr key={exhibit.slug} className="hover:bg-hair/20">
                <td className="px-4 py-4">
                  <div className="font-medium text-ink">{exhibit.title}</div>
                  <div className="text-sm text-fog">{exhibit.code}</div>
                </td>
                <td className="px-4 py-4">
                  {auction ? (
                    <StatusBadge status={auction.status} />
                  ) : staticAuction ? (
                    <span className="px-2 py-1 text-xs font-mono rounded bg-hair text-fog">
                      NOT SYNCED
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-mono rounded bg-hair/50 text-fog/50">
                      NO AUCTION
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {auction?.currentBid ? (
                    <span className="font-mono font-bold text-ink">
                      ${(auction.currentBid / 100).toLocaleString()}
                    </span>
                  ) : staticAuction ? (
                    <span className="font-mono text-fog">
                      ${parseInt(staticAuction.openingBid).toLocaleString()} (opening)
                    </span>
                  ) : (
                    <span className="text-fog">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-ink">
                    {auction?._count.bids ?? 0}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {auction?.endsAt ? (
                    <span className="text-sm text-fog">
                      {new Date(auction.endsAt).toLocaleDateString()}
                    </span>
                  ) : staticAuction?.endsAt ? (
                    <span className="text-sm text-fog">
                      {new Date(staticAuction.endsAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-fog">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/auctions/${exhibit.slug}`}
                    className="px-3 py-1.5 text-sm bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
}
