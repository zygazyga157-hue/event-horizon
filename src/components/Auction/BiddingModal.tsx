/**
 * Bidding Modal Component
 * Full-screen modal for placing bids
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { AuctionCountdown } from "./AuctionCountdown";
import { formatCurrency, BID_TYPE_LABELS } from "@/lib/bidding/constants";
import type { AuctionStateSnapshot, BidType } from "@/lib/bidding/types";

interface BiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AuctionStateSnapshot;
  artifactName: string;
  onPlaceBid: (bid: {
    bidderName: string;
    bidderEmail?: string;
    bidType: BidType;
    amount: number;
    message?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function BiddingModal({
  isOpen,
  onClose,
  state,
  artifactName,
  onPlaceBid,
}: BiddingModalProps) {
  const minNextBid = (state.currentBid ?? state.openingBid) + state.minIncrement;

  const [bidderName, setBidderName] = useState("");
  const [bidderEmail, setBidderEmail] = useState("");
  const [bidType, setBidType] = useState<BidType>(state.allowedBidTypes[0]);
  const [amountCents, setAmountCents] = useState<number>(minNextBid);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  // Reset form when opened (using wasOpen to track state transitions)
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setAmountCents(minNextBid);
    setError(null);
    setSuccess(false);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!bidderName.trim()) {
        setError("Please enter your name");
        return;
      }

      if (amountCents < minNextBid) {
        setError(`Minimum bid is ${formatCurrency(minNextBid, state.currency)}`);
        return;
      }

      setIsSubmitting(true);

      const result = await onPlaceBid({
        bidderName: bidderName.trim(),
        bidderEmail: bidderEmail.trim() || undefined,
        bidType,
        amount: amountCents,
        message: message.trim() || undefined,
      });

      setIsSubmitting(false);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Failed to place bid");
      }
    },
    [
      bidderName,
      bidderEmail,
      bidType,
      amountCents,
      message,
      minNextBid,
      state.currency,
      onPlaceBid,
      onClose,
    ]
  );

  // Convert cents to dollars for display
  const amountDollars = (amountCents / 100).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-xl bg-paper border border-hair shadow-museum overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-hair">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-ink">Place a Bid</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-hair text-fog hover:text-ink transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-fog">{artifactName}</p>
            </div>

            {/* Auction Info */}
            <div className="p-4 bg-hair flex items-center justify-between">
              <div>
                <div className="text-xs text-fog mb-1">Current Bid</div>
                <div className="text-xl font-bold text-ink">
                  {formatCurrency(state.currentBid ?? state.openingBid, state.currency)}
                </div>
              </div>
              <div className="text-right">
                <AuctionStatusBadge status={state.status} />
                {state.endsAt && (
                  <div className="mt-2">
                    <AuctionCountdown endsAt={state.endsAt} className="text-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-fog mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-paper border border-hair text-ink placeholder-fog focus:outline-none focus:border-ink"
                  placeholder="Enter your name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-fog mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={bidderEmail}
                  onChange={(e) => setBidderEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-paper border border-hair text-ink placeholder-fog focus:outline-none focus:border-ink"
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Bid Type */}
              <div>
                <label className="block text-sm text-fog mb-1">
                  Bid Type
                </label>
                <select
                  value={bidType}
                  onChange={(e) => setBidType(e.target.value as BidType)}
                  className="w-full px-3 py-2 rounded-lg bg-paper border border-hair text-ink focus:outline-none focus:border-ink"
                  disabled={isSubmitting}
                >
                  {state.allowedBidTypes.map((type) => (
                    <option key={type} value={type}>
                      {BID_TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm text-fog mb-1">
                  Bid Amount ({state.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fog">
                    $
                  </span>
                  <input
                    type="number"
                    value={amountDollars}
                    onChange={(e) =>
                      setAmountCents(Math.round(parseFloat(e.target.value || "0") * 100))
                    }
                    min={(minNextBid / 100).toFixed(2)}
                    step="0.01"
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-paper border border-hair text-ink placeholder-fog focus:outline-none focus:border-ink"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-fog mt-1">
                  Minimum: {formatCurrency(minNextBid, state.currency)}
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm text-fog mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-paper border border-hair text-ink placeholder-fog focus:outline-none focus:border-ink resize-none"
                  placeholder="Add a message..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-hair border border-ink/30 text-ink text-sm">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-hair border border-ink/30 text-ink text-sm text-center"
                >
                  ✓ Bid placed successfully!
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || success || state.status !== "LIVE"}
                className="w-full py-3 px-4 rounded-lg bg-ink hover:bg-ink/80 disabled:bg-hair disabled:text-fog text-paper font-semibold transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full"
                    />
                    Placing Bid...
                  </span>
                ) : (
                  `Place Bid: ${formatCurrency(amountCents, state.currency)}`
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
