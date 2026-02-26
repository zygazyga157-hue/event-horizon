/**
 * POST /api/auctions/[id]/bid
 * Place a bid on an auction
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { placeBid, BidType } from "@/lib/bidding";
import { gateWSHub } from "@/lib/ws";

const BidSchema = z.object({
  bidderName: z.string().min(1).max(100),
  bidderEmail: z.string().email().optional(),
  bidType: z.enum([
    "FIXED_PRICE",
    "HOURLY_RATE",
    "RETAINER",
    "DONATION",
    "SPONSOR_TIER",
    "MILESTONE_SPONSOR",
  ]),
  amount: z.number().int().positive(), // Amount in cents
  message: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auctionId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = BidSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid bid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { bidderName, bidderEmail, bidType, amount, message } = validation.data;

    // Place the bid
    const result = await placeBid({
      auctionId,
      bidderName,
      bidderEmail,
      bidType: bidType as BidType,
      amount,
      message,
    });

    if (!result.success) {
      const statusCode = result.errorCode === "AUCTION_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: result.error, code: result.errorCode },
        { status: statusCode }
      );
    }

    // Broadcast bid update via WebSocket
    gateWSHub.broadcastToTopic(`auction:${auctionId}`, {
      type: "bid_placed",
      auctionId,
      currentBid: result.newCurrentBid!,
      bidCount: 0, // Will be updated by client refetch
      leadingBidderName: bidderName,
      endsAt: result.endsAt ?? null,
    });

    return NextResponse.json({
      success: true,
      bidId: result.bidId,
      currentBid: result.newCurrentBid,
      endsAt: result.endsAt,
    });
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}
