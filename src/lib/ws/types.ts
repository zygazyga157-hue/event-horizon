/**
 * WebSocket message types for Gate realtime updates
 */

// Client -> Server messages
export interface WSClientHello {
  type: "hello";
  token: string;
  clientId: string;
}

export interface WSClientPong {
  type: "pong";
  nonce: string;
}

export interface WSClientSubscribe {
  type: "subscribe";
  topics: ("occupancy" | "promotion")[];
}

// Client subscribe to auction updates
export interface WSClientSubscribeAuction {
  type: "subscribe_auction";
  auctionId: string;
}

export interface WSClientUnsubscribeAuction {
  type: "unsubscribe_auction";
  auctionId: string;
}

export type WSClientMessage = 
  | WSClientHello 
  | WSClientPong 
  | WSClientSubscribe
  | WSClientSubscribeAuction
  | WSClientUnsubscribeAuction;

// Server -> Client messages
export interface WSServerAccept {
  type: "accept";
  connId: string;
  heartbeatIntervalMs: number;
}

export interface WSServerReject {
  type: "reject";
  code: string;
  reason: string;
}

export interface WSServerPing {
  type: "ping";
  nonce: string;
}

export interface WSServerOccupancy {
  type: "occupancy";
  activeCount: number;
  capacity: number;
  queueLength: number;
}

export interface WSServerPromoted {
  type: "promoted";
  tokenHash: string;
}

export interface WSServerExpired {
  type: "expired";
  reason: string;
}

// Bidding WebSocket messages
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
  auctionId: string;
  status: string;
  currentBid: number | null;
  bidCount: number;
  leadingBidderName: string | null;
  endsAt: string | null;
}

export type WSServerMessage =
  | WSServerAccept
  | WSServerReject
  | WSServerPing
  | WSServerOccupancy
  | WSServerPromoted
  | WSServerExpired
  | WSBidPlaced
  | WSAuctionEnded
  | WSAuctionStateUpdate;

// Envelope for all messages
export interface WSEnvelope<T> {
  id?: string;
  ts: number;
  data: T;
}

export function createEnvelope<T>(data: T, id?: string): WSEnvelope<T> {
  return {
    id,
    ts: Date.now(),
    data,
  };
}

export function parseWSMessage(raw: string): WSClientMessage | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.data) {
      return parsed.data as WSClientMessage;
    }
    return parsed as WSClientMessage;
  } catch {
    return null;
  }
}

export function serializeWSMessage<T>(message: T): string {
  return JSON.stringify(createEnvelope(message));
}
