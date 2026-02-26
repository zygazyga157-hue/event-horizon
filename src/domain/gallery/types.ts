/**
 * Gallery Domain Models
 * Exhibit = skill category; Artifact = project within exhibit
 */

export type ExhibitStatus = "Shipped" | "In Progress" | "Research" | "Client-ready";

export type Link = {
  label: string;
  href: string;
};

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

// Single auction per exhibit (representing the whole program)
export type Auction = {
  auctionKind: AuctionKind;
  status: AuctionStatus;
  currency: string;
  openingBid: string;
  minIncrement: string;
  scheduledStart?: string; // ISO date for when auction goes live
  endsAt?: string;
  antiSnipingSeconds?: number;
  allowedBidTypes: BidType[];
};

export type MediaItem = {
  label: string;
  audioSrc: string;
  documentId: string;
};

export type Artifact = {
  id: string;
  name: string;
  status: string;
  description: string;
  stack: string[];
  proof?: {
    results?: string[];
    screenshots?: string[];
    links?: Link[];
  };
  costs?: {
    monthly?: string;
    oneTime?: string;
  };
  funding?: {
    needed?: string;
    milestone?: string;
    breakdown?: { label: string; pct: string }[];
  };
  opportunities?: {
    acceptedTypes: string[];
    industries: string[];
    deliverables?: string[];
  };
  links?: Link[];
  media?: MediaItem[];
  updatedAt: string;
};

export type Exhibit = {
  slug: string;
  code: string;
  version: string;
  updatedAt: string;
  title: string;
  thesis: string;
  status: ExhibitStatus;
  tags: string[];
  metaLine?: string;
  placard: {
    what: string;
    why: string;
    approach: string;
  };
  roadmap?: {
    items: { label: string; done: boolean }[];
  };
  // Single auction per exhibit (representing the whole program)
  auction?: Auction;
  artifacts: Artifact[];
};
