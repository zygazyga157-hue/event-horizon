/**
 * Place Bid Service
 * Atomic transaction for placing bids with anti-sniping logic
 */
import { prisma } from "@/lib/prisma";
import { BidRequest, BidResult, BidType } from "./types";
import { DEFAULT_ANTI_SNIPE_SECONDS } from "./constants";

/**
 * Places a bid in an atomic transaction
 * - Validates auction is live
 * - Validates bid type is allowed
 * - Validates bid amount >= currentBid + minIncrement
 * - Creates bid record
 * - Updates auction currentBid and leadingBidderId
 * - Extends endsAt if within anti-sniping window
 * - Creates state snapshot
 */
export async function placeBid(request: BidRequest): Promise<BidResult> {
  const { auctionId, bidderName, bidderEmail, bidType, amount, message } = request;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and lock auction
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!auction) {
        return {
          success: false,
          error: "Auction not found",
          errorCode: "AUCTION_NOT_FOUND" as const,
        };
      }

      // 2. Validate auction is live
      if (auction.status !== "LIVE") {
        return {
          success: false,
          error: "Auction has ended or is paused",
          errorCode: "AUCTION_ENDED" as const,
        };
      }

      // Check if past end time
      if (auction.endsAt && new Date() > auction.endsAt) {
        // Auto-end the auction
        await tx.auction.update({
          where: { id: auctionId },
          data: { status: "ENDED" },
        });
        return {
          success: false,
          error: "Auction has ended",
          errorCode: "AUCTION_ENDED" as const,
        };
      }

      // 3. Validate bid type
      const allowedTypes: BidType[] = JSON.parse(auction.allowedBidTypes);
      if (!allowedTypes.includes(bidType)) {
        return {
          success: false,
          error: `Bid type ${bidType} is not allowed for this auction`,
          errorCode: "INVALID_BID_TYPE" as const,
        };
      }

      // 4. Validate bid amount
      const minRequired = auction.currentBid
        ? auction.currentBid + auction.minIncrement
        : auction.openingBid;

      if (amount < minRequired) {
        return {
          success: false,
          error: `Bid must be at least ${minRequired} cents`,
          errorCode: "BID_TOO_LOW" as const,
        };
      }

      // 5. Calculate new end time (anti-sniping)
      let newEndsAt = auction.endsAt;
      if (auction.endsAt) {
        const antiSnipeWindow = (auction.antiSnipingSeconds || DEFAULT_ANTI_SNIPE_SECONDS) * 1000;
        const timeUntilEnd = auction.endsAt.getTime() - Date.now();
        
        if (timeUntilEnd < antiSnipeWindow) {
          // Extend the auction
          newEndsAt = new Date(Date.now() + antiSnipeWindow);
        }
      }

      // 6. Create bid record
      const bidderId = bidderEmail || `anon_${Date.now()}`;
      const bid = await tx.bid.create({
        data: {
          auctionId,
          bidderId,
          bidderName,
          bidderEmail,
          bidType,
          amount,
          message: message?.slice(0, 500),
          isWinning: true,
        },
      });

      // Mark previous winning bid as not winning
      if (auction.bids.length > 0) {
        await tx.bid.updateMany({
          where: {
            auctionId,
            id: { not: bid.id },
            isWinning: true,
          },
          data: { isWinning: false },
        });
      }

      // 7. Update auction
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentBid: amount,
          leadingBidderId: bidderId,
          endsAt: newEndsAt,
        },
      });

      // 8. Create state snapshot
      const bidCount = await tx.bid.count({ where: { auctionId } });
      await tx.auctionState.create({
        data: {
          auctionId,
          currentBid: amount,
          leadingName: bidderName,
          bidCount,
          endsAt: newEndsAt,
          status: "LIVE",
        },
      });

      return {
        success: true,
        bidId: bid.id,
        newCurrentBid: amount,
        endsAt: newEndsAt?.toISOString(),
      };
    });

    return result;
  } catch (error) {
    console.error("Error placing bid:", error);
    return {
      success: false,
      error: "Failed to place bid. Please try again.",
    };
  }
}

/**
 * Get current auction state
 */
export async function getAuctionState(auctionId: string) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        where: { isWinning: true },
        take: 1,
      },
      _count: {
        select: { bids: true },
      },
    },
  });

  if (!auction) return null;

  const allowedBidTypes: BidType[] = JSON.parse(auction.allowedBidTypes);
  const leadingBid = auction.bids[0];

  return {
    auctionId: auction.id,
    exhibitSlug: auction.exhibitSlug,
    kind: auction.kind as "ACQUIREMENT" | "FUNDING",
    status: auction.status as "DRAFT" | "SCHEDULED" | "LIVE" | "PAUSED" | "ENDED",
    currency: auction.currency,
    openingBid: auction.openingBid,
    minIncrement: auction.minIncrement,
    currentBid: auction.currentBid,
    leadingBidderName: leadingBid?.bidderName ?? null,
    bidCount: auction._count.bids,
    scheduledStart: auction.scheduledStart?.toISOString() ?? null,
    endsAt: auction.endsAt?.toISOString() ?? null,
    endedAt: auction.endedAt?.toISOString() ?? null,
    antiSnipingSeconds: auction.antiSnipingSeconds,
    allowedBidTypes,
  };
}

/**
 * Get auction by exhibit slug
 */
export async function getAuctionByExhibit(exhibitSlug: string) {
  return prisma.auction.findUnique({
    where: { exhibitSlug },
  });
}

/**
 * Create or update auction from static content
 */
export async function syncAuctionFromContent(
  exhibitSlug: string,
  auctionData: {
    kind: "ACQUIREMENT" | "FUNDING";
    currency?: string;
    openingBid: number;
    minIncrement: number;
    scheduledStart?: Date;
    endsAt?: Date;
    antiSnipingSeconds?: number;
    allowedBidTypes: BidType[];
  }
) {
  return prisma.auction.upsert({
    where: { exhibitSlug },
    create: {
      exhibitSlug,
      kind: auctionData.kind,
      status: auctionData.scheduledStart ? "SCHEDULED" : "LIVE",
      currency: auctionData.currency || "USD",
      openingBid: auctionData.openingBid,
      minIncrement: auctionData.minIncrement,
      scheduledStart: auctionData.scheduledStart,
      endsAt: auctionData.endsAt,
      antiSnipingSeconds: auctionData.antiSnipingSeconds || DEFAULT_ANTI_SNIPE_SECONDS,
      allowedBidTypes: JSON.stringify(auctionData.allowedBidTypes),
    },
    update: {
      kind: auctionData.kind,
      currency: auctionData.currency || "USD",
      openingBid: auctionData.openingBid,
      minIncrement: auctionData.minIncrement,
      antiSnipingSeconds: auctionData.antiSnipingSeconds || DEFAULT_ANTI_SNIPE_SECONDS,
      allowedBidTypes: JSON.stringify(auctionData.allowedBidTypes),
    },
  });
}
