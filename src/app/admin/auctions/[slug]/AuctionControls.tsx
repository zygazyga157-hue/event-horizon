/**
 * Auction Controls Component
 * Client component with auction management actions
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Auction } from "@/domain/gallery";

interface AuctionControlsProps {
  exhibitSlug: string;
  auction: {
    id: string;
    status: string;
    currentBid: number | null;
    bidCount: number;
  } | null;
  staticAuction?: Auction;
}

export function AuctionControls({ exhibitSlug, auction, staticAuction }: AuctionControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleAction = async (action: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/auctions/${exhibitSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Action failed");
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSync = async () => {
    if (!staticAuction) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/auctions/${exhibitSlug}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync failed");
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendInvoice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/auctions/${exhibitSlug}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invoice");
      }
      
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <div className="text-sm text-ink bg-ink/5 border border-ink px-3 py-1 rounded">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        {!auction && staticAuction && (
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Syncing..." : "Sync to Database"}
          </button>
        )}
        
        {auction && (
          <>
            {auction.status === "DRAFT" && (
              <button
                onClick={() => handleAction("start")}
                disabled={loading}
                className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Auction"}
              </button>
            )}
            
            {auction.status === "LIVE" && (
              <>
                <button
                  onClick={() => handleAction("pause")}
                  disabled={loading}
                  className="px-4 py-2 bg-hair text-ink text-sm font-medium rounded hover:bg-hair/80 transition-colors disabled:opacity-50"
                >
                  {loading ? "Pausing..." : "Pause"}
                </button>
                <button
                  onClick={() => handleAction("end")}
                  disabled={loading}
                  className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Ending..." : "End Auction"}
                </button>
              </>
            )}
            
            {auction.status === "PAUSED" && (
              <>
                <button
                  onClick={() => handleAction("resume")}
                  disabled={loading}
                  className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Resuming..." : "Resume"}
                </button>
                <button
                  onClick={() => handleAction("end")}
                  disabled={loading}
                  className="px-4 py-2 bg-hair text-ink text-sm font-medium rounded hover:bg-hair/80 transition-colors disabled:opacity-50"
                >
                  {loading ? "Ending..." : "End Auction"}
                </button>
              </>
            )}
            
            {auction.status === "ENDED" && auction.bidCount > 0 && (
              <button
                onClick={handleSendInvoice}
                disabled={loading}
                className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Winner Invoice"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
