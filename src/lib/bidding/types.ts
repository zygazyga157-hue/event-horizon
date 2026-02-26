/**
 * Bidding System Types
 */

export type AuctionKind = "ACQUIREMENT" | "FUNDING";
export type AuctionStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "PAUSED" | "ENDED";
export type BidType =
  | "FIXED_PRICE"
  | "HOURLY_RATE"
  | "RETAINER"
  | "DONATION"
  | "SPONSOR_TIER"
  | "MILESTONE_SPONSOR"
  | "EQUITY_OFFER";

export interface AuctionStateSnapshot {
  auctionId: string;
  artifactId: string;
  exhibitSlug: string;
  kind: AuctionKind;
  status: AuctionStatus;
  currency: string;
  openingBid: number; // cents
  minIncrement: number; // cents
  currentBid: number | null; // cents
  leadingBidderName: string | null;
  bidCount: number;
  endsAt: string | null;
  antiSnipingSeconds: number;
  allowedBidTypes: BidType[];
}

export interface BidRequest {
  auctionId: string;
  bidderName: string;
  bidderEmail?: string;
  bidType: BidType;
  amount: number; // cents
  message?: string;
}

export interface BidResult {
  success: boolean;
  bidId?: string;
  newCurrentBid?: number;
  endsAt?: string;
  error?: string;
  errorCode?: "AUCTION_ENDED" | "BID_TOO_LOW" | "INVALID_BID_TYPE" | "AUCTION_NOT_FOUND";
}

// Email notification types
export interface BidNotificationData {
  auctionId: string;
  artifactName: string;
  exhibitTitle: string;
  bidderName: string;
  bidderEmail?: string;
  amount: number;
  currency: string;
  bidType: BidType;
  message?: string;
}

// WebSocket message types for bidding
export interface WSBidPlaced {
  type: "bid_placed";
  auctionId: string;
  currentBid: number;
  bidCount: number;
  leadingBidderName: string;
  endsAt: string | null;
}

export interface WSAuctionEnded {
  type: "auction_ended";
  auctionId: string;
  winningBid: number | null;
  winnerName: string | null;
}

export interface WSAuctionStateUpdate {
  type: "auction_state";
  state: AuctionStateSnapshot;
}

export type WSBiddingMessage = WSBidPlaced | WSAuctionEnded | WSAuctionStateUpdate;
