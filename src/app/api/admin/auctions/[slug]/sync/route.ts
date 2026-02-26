/**
 * POST /api/admin/auctions/[slug]/sync
 * Sync auction from content to database
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce } from "@/lib/gate/hashing";
import { exhibits } from "@/content/exhibits";

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

export async function POST(request: NextRequest, context: RouteContext) {
  const session = await verifyAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { slug } = await context.params;
  
  try {
    // Find exhibit in content
    const exhibit = exhibits.find((e) => e.slug === slug);
    if (!exhibit) {
      return NextResponse.json({ error: "Exhibit not found" }, { status: 404 });
    }
    
    if (!exhibit.auction) {
      return NextResponse.json({ error: "Exhibit has no auction configured" }, { status: 400 });
    }
    
    const contentAuction = exhibit.auction;
    
    // Parse auction data from content
    const openingBidCents = Math.round(parseFloat(contentAuction.openingBid.replace(/[^0-9.]/g, '')) * 100);
    const minIncrementCents = Math.round(parseFloat(contentAuction.minIncrement.replace(/[^0-9.]/g, '')) * 100);
    const endsAtDate = contentAuction.endsAt ? new Date(contentAuction.endsAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const scheduledStartDate = contentAuction.scheduledStart ? new Date(contentAuction.scheduledStart) : undefined;
    const kind = contentAuction.auctionKind || "ACQUIREMENT";
    const allowedBidTypes = JSON.stringify(contentAuction.allowedBidTypes || ["FIXED_PRICE"]);
    
    // Check if auction already exists
    const existingAuction = await prisma.auction.findUnique({
      where: { exhibitSlug: slug },
    });
    
    const auction = await prisma.auction.upsert({
      where: { exhibitSlug: slug },
      create: {
        exhibitSlug: slug,
        kind,
        allowedBidTypes,
        openingBid: openingBidCents,
        currentBid: openingBidCents,
        minIncrement: minIncrementCents,
        endsAt: endsAtDate,
        status: contentAuction.status || "DRAFT",
        scheduledStart: scheduledStartDate,
      },
      update: {
        openingBid: openingBidCents,
        minIncrement: minIncrementCents,
        endsAt: endsAtDate,
        scheduledStart: scheduledStartDate,
        allowedBidTypes,
        // Only update status if still in DRAFT
        ...(existingAuction?.status === "DRAFT" || !existingAuction
          ? { status: contentAuction.status || "DRAFT" }
          : {}),
      },
    });
    
    // Create initial state snapshot
    await prisma.auctionState.create({
      data: {
        auctionId: auction.id,
        currentBid: auction.currentBid,
        leadingName: null,
        bidCount: 0,
        endsAt: auction.endsAt,
        status: auction.status,
      },
    });
    
    // Log the sync
    await prisma.auditLog.create({
      data: {
        sessionId: session.id,
        action: "AUCTION_SYNC",
        entityType: "AUCTION",
        entityId: auction.id,
        details: JSON.stringify({
          exhibitSlug: slug,
          exhibitTitle: exhibit.title,
          openingBid: contentAuction.openingBid,
        }),
      },
    });
    
    return NextResponse.json({ success: true, auction });
  } catch (error) {
    console.error("Admin auction sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
