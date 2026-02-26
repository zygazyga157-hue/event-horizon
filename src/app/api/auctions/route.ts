/**
 * GET /api/auctions
 * List all active auctions or get auction by exhibit
 * 
 * Query params:
 * - exhibitSlug: Filter by exhibit slug
 * - status: Filter by status (DRAFT, SCHEDULED, LIVE, PAUSED, ENDED)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const exhibitSlug = searchParams.get("exhibitSlug");
    const status = searchParams.get("status");

    const where: Prisma.AuctionWhereInput = {};

    if (exhibitSlug) where.exhibitSlug = exhibitSlug;
    if (status) where.status = status;

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        _count: {
          select: { bids: true },
        },
        bids: {
          where: { isWinning: true },
          take: 1,
          select: {
            bidderName: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = auctions.map((auction) => ({
      id: auction.id,
      exhibitSlug: auction.exhibitSlug,
      kind: auction.kind,
      status: auction.status,
      currency: auction.currency,
      openingBid: auction.openingBid,
      minIncrement: auction.minIncrement,
      currentBid: auction.currentBid,
      leadingBidderName: auction.bids[0]?.bidderName ?? null,
      bidCount: auction._count.bids,
      scheduledStart: auction.scheduledStart?.toISOString() ?? null,
      endsAt: auction.endsAt?.toISOString() ?? null,
      endedAt: auction.endedAt?.toISOString() ?? null,
      winnerId: auction.winnerId,
      createdAt: auction.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
