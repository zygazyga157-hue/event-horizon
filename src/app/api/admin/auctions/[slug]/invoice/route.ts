/**
 * POST /api/admin/auctions/[slug]/invoice
 * Send invoice to auction winner
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unsealToken } from "@/lib/auth/iron";
import { hashNonce } from "@/lib/gate/hashing";
import { sendAuctionWinnerEmail } from "@/lib/email/smtp";
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
    const auction = await prisma.auction.findUnique({
      where: { exhibitSlug: slug },
    });
    
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }
    
    if (auction.status !== "ENDED") {
      return NextResponse.json({ error: "Auction must be ended to send invoice" }, { status: 400 });
    }
    
    if (!auction.winnerEmail) {
      return NextResponse.json({ error: "No winner for this auction" }, { status: 400 });
    }
    
    if (auction.invoiceSentAt) {
      return NextResponse.json({ error: "Invoice already sent" }, { status: 400 });
    }
    
    // Get exhibit info for email
    const exhibit = exhibits.find((e) => e.slug === slug);
    const exhibitTitle = exhibit?.title || slug;
    
    // Get winner name from winning bid
    const winningBid = await prisma.bid.findFirst({
      where: { auctionId: auction.id, isWinning: true },
    });
    const winnerName = winningBid?.bidderName || 'Winner';
    
    // Format bid amount (stored in cents)
    const bidAmount = ((auction.currentBid || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
    
    // Send winner email
    await sendAuctionWinnerEmail(
      auction.winnerEmail,
      winnerName,
      exhibitTitle,
      bidAmount,
      'USD'
    );
    
    // Update auction with invoice sent timestamp
    await prisma.auction.update({
      where: { exhibitSlug: slug },
      data: { invoiceSentAt: new Date() },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        sessionId: session.id,
        action: "AUCTION_INVOICE_SENT",
        entityType: "AUCTION",
        entityId: auction.id,
        details: JSON.stringify({
          winnerEmail: auction.winnerEmail,
          amount: auction.currentBid,
          exhibitTitle,
        }),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Invoice sent to ${auction.winnerEmail}` 
    });
  } catch (error) {
    console.error("Admin invoice send error:", error);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 });
  }
}
