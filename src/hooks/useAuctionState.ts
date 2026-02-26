/**
 * React hook for realtime auction state via WebSocket
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { AuctionStateSnapshot, BidType } from "@/lib/bidding/types";

interface AuctionState {
  loading: boolean;
  error: string | null;
  data: AuctionStateSnapshot | null;
  bidCount: number;
}

interface UseAuctionStateOptions {
  /** Poll interval in ms when WebSocket unavailable */
  pollInterval?: number;
  /** Enable WebSocket realtime updates */
  enableRealtime?: boolean;
}

/**
 * Hook to get and subscribe to auction state updates
 */
export function useAuctionState(
  auctionId: string | null,
  options: UseAuctionStateOptions = {}
) {
  const { pollInterval = 30000, enableRealtime = true } = options;
  
  const [state, setState] = useState<AuctionState>({
    loading: true,
    error: null,
    data: null,
    bidCount: 0,
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch auction state from API
  const fetchState = useCallback(async () => {
    if (!auctionId) return;
    
    try {
      const res = await fetch(`/api/auctions/${auctionId}/state`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Auction not found",
            data: null,
          }));
          return;
        }
        throw new Error("Failed to fetch auction state");
      }
      
      const data: AuctionStateSnapshot = await res.json();
      setState({
        loading: false,
        error: null,
        data,
        bidCount: data.bidCount,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [auctionId]);

  // WebSocket connection for realtime updates
  useEffect(() => {
    if (!auctionId || !enableRealtime) return;

    // Initial fetch
    fetchState();

    // Setup WebSocket
    const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to auction updates
      ws.send(JSON.stringify({
        ts: Date.now(),
        data: { type: "subscribe_auction", auctionId },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data);
        const msg = envelope.data;

        if (msg.type === "bid_placed" && msg.auctionId === auctionId) {
          // Update state with new bid info
          setState((prev) => ({
            ...prev,
            data: prev.data
              ? {
                  ...prev.data,
                  currentBid: msg.currentBid,
                  leadingBidderName: msg.leadingBidderName,
                  endsAt: msg.endsAt,
                }
              : null,
            bidCount: msg.bidCount || prev.bidCount + 1,
          }));
        } else if (msg.type === "auction_state" && msg.auctionId === auctionId) {
          setState((prev) => ({
            ...prev,
            data: prev.data
              ? {
                  ...prev.data,
                  status: msg.status as AuctionStateSnapshot["status"],
                  currentBid: msg.currentBid,
                  leadingBidderName: msg.leadingBidderName,
                  endsAt: msg.endsAt,
                }
              : null,
            bidCount: msg.bidCount,
          }));
        } else if (msg.type === "auction_ended" && msg.auctionId === auctionId) {
          setState((prev) => ({
            ...prev,
            data: prev.data
              ? {
                  ...prev.data,
                  status: "ENDED" as const,
                  currentBid: msg.winningBid,
                  leadingBidderName: msg.winnerName,
                }
              : null,
          }));
        }
      } catch (e) {
        console.error("Failed to parse WS message:", e);
      }
    };

    ws.onerror = () => {
      console.error("Auction WS error, falling back to polling");
    };

    ws.onclose = () => {
      // Fallback to polling if WebSocket closes
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = setInterval(fetchState, pollInterval);
    };

    return () => {
      if (wsRef.current) {
        // Unsubscribe before closing
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            ts: Date.now(),
            data: { type: "unsubscribe_auction", auctionId },
          }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearInterval(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [auctionId, enableRealtime, fetchState, pollInterval]);

  // Place a bid
  const placeBid = useCallback(
    async (bid: {
      bidderName: string;
      bidderEmail?: string;
      bidType: BidType;
      amount: number;
      message?: string;
    }) => {
      if (!auctionId) {
        return { success: false, error: "No auction selected" };
      }

      try {
        const res = await fetch(`/api/auctions/${auctionId}/bid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bid),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.error || "Failed to place bid",
            code: data.code,
          };
        }

        // Refetch state to ensure consistency
        await fetchState();

        return {
          success: true,
          bidId: data.bidId,
          currentBid: data.currentBid,
          endsAt: data.endsAt,
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    [auctionId, fetchState]
  );

  // Refresh state manually
  const refresh = useCallback(() => {
    fetchState();
  }, [fetchState]);

  return {
    ...state,
    placeBid,
    refresh,
    isLive: state.data?.status === "LIVE",
    isEnded: state.data?.status === "ENDED",
    isPaused: state.data?.status === "PAUSED",
    minNextBid: state.data
      ? (state.data.currentBid ?? state.data.openingBid) + state.data.minIncrement
      : null,
  };
}
