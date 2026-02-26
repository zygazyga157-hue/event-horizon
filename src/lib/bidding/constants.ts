/**
 * Bidding System Constants
 */

// Anti-sniping: extend auction by this many seconds when bid placed near end
export const DEFAULT_ANTI_SNIPE_SECONDS = 300; // 5 minutes

// Maximum message length for bids
export const MAX_BID_MESSAGE_LENGTH = 500;

// Minimum values in cents
export const MIN_OPENING_BID_CENTS = 100; // $1.00
export const MIN_INCREMENT_CENTS = 100; // $1.00

// Email templates
export const EMAIL_SUBJECTS = {
  NEW_BID: (artifactName: string) => `New Bid on ${artifactName}`,
  OUTBID: (artifactName: string) => `You've been outbid on ${artifactName}`,
  AUCTION_WON: (artifactName: string) => `You won the auction for ${artifactName}`,
  AUCTION_ENDED: (artifactName: string) => `Auction ended for ${artifactName}`,
} as const;

// Currency formatting
export function formatCurrency(cents: number, currency: string = "USD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Bid type labels for display
export const BID_TYPE_LABELS: Record<string, string> = {
  FIXED_PRICE: "Fixed Price",
  HOURLY_RATE: "Hourly Rate",
  RETAINER: "Retainer",
  DONATION: "Donation",
  SPONSOR_TIER: "Sponsor Tier",
  MILESTONE_SPONSOR: "Milestone Sponsor",
  EQUITY_OFFER: "Equity Offer",
};
