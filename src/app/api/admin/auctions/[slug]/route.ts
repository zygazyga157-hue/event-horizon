/**
 * PATCH /api/admin/auctions/[slug]
 * Admin auction management actions
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce } from "@/lib/gate/hashing";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function verifyAdmin() {
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { slug } = await context.params;
  const body = await request.json();
  const { action } = body;
  
  try {
    const auction = await prisma.auction.findUnique({
      where: { exhibitSlug: slug },
    });
    
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    
    let newStatus: string;
    const additionalData: Record<string, unknown> = {};
    
    switch (action) {
      case "start":
        if (auction.status !== "DRAFT" && auction.status !== "SCHEDULED") {
          return NextResponse.json({ error: "Cannot start auction in current state" }, { status: 400 });
        }
        newStatus = "LIVE";
        break;
        
      case "pause":
        if (auction.status !== "LIVE") {
          return NextResponse.json({ error: "Can only pause live auctions" }, { status: 400 });
        }
        newStatus = "PAUSED";
        break;
        
      case "resume":
        if (auction.status !== "PAUSED") {
          return NextResponse.json({ error: "Can only resume paused auctions" }, { status: 400 });
        }
        newStatus = "LIVE";
        break;
        
      case "end":
        if (auction.status !== "LIVE" && auction.status !== "PAUSED") {
          return NextResponse.json({ error: "Cannot end auction in current state" }, { status: 400 });
        }
        newStatus = "ENDED";
        additionalData.endedAt = new Date();
        
        // Find winning bid and set winner
        const winningBid = await prisma.bid.findFirst({
          where: { auctionId: auction.id, isWinning: true },
        });
        if (winningBid) {
          additionalData.winnerId = winningBid.bidderId;
          additionalData.winnerEmail = winningBid.bidderEmail;
        }
        break;
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
    // Update auction
    const updated = await prisma.auction.update({
      where: { exhibitSlug: slug },
      data: { status: newStatus, ...additionalData },
    });
    
    // Create state snapshot
    await prisma.auctionState.create({
      data: {
        auctionId: auction.id,
        currentBid: auction.currentBid,
        leadingName: auction.leadingBidderId,
        bidCount: await prisma.bid.count({ where: { auctionId: auction.id } }),
        endsAt: auction.endsAt,
        status: newStatus,
      },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        sessionId: session.id,
        action: `AUCTION_${action.toUpperCase()}`,
        entityType: "AUCTION",
        entityId: auction.id,
        details: JSON.stringify({ previousStatus: auction.status, newStatus }),
      },
    });
    
    return NextResponse.json({ success: true, auction: updated });
  } catch (error) {
    console.error("Admin auction action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
