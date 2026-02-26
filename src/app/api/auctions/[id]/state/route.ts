/**
 * GET /api/auctions/[id]/state
 * Returns the current state of an auction
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuctionState } from "@/lib/bidding";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const state = await getAuctionState(id);

    if (!state) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error("Error fetching auction state:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction state" },
      { status: 500 }
    );
  }
}
