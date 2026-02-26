"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGateWS } from "@/hooks/useGateWS";

interface HeartbeatClientProps {
  intervalMs?: number;
  onStatusChange?: (status: string) => void;
  onOccupancyChange?: (data: { activeCount: number; capacity: number; queueLength?: number }) => void;
  onQueuePositionChange?: (position: number) => void;
  onPromoted?: () => void;
  onExpired?: () => void;
  enabled?: boolean;
  /** Use WebSocket for realtime updates (falls back to polling) */
  useWebSocket?: boolean;
  /** Token for WebSocket authentication */
  token?: string;
}

/**
 * Client-side heartbeat to keep session alive
 * Uses WebSocket for realtime updates with polling fallback
 */
export function HeartbeatClient({
  intervalMs = 20000,
  onStatusChange,
  onOccupancyChange,
  onQueuePositionChange,
  onPromoted,
  onExpired,
  enabled = true,
  useWebSocket = true,
  token,
}: HeartbeatClientProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatus = useRef<string | null>(null);

  // WebSocket connection
  const {
    isConnected,
    occupancy,
    wasPromoted,
    expiredReason,
    clearPromoted,
  } = useGateWS({
    token,
    autoConnect: enabled && useWebSocket,
  });

  // Handle WebSocket occupancy updates
  useEffect(() => {
    if (occupancy && isConnected) {
      onOccupancyChange?.({
        activeCount: occupancy.activeCount,
        capacity: occupancy.capacity,
        queueLength: occupancy.queueLength,
      });
    }
  }, [occupancy, isConnected, onOccupancyChange]);

  // Handle WebSocket promotion
  useEffect(() => {
    if (wasPromoted) {
      onPromoted?.();
      clearPromoted();
    }
  }, [wasPromoted, onPromoted, clearPromoted]);

  // Handle WebSocket expiration
  useEffect(() => {
    if (expiredReason) {
      onExpired?.();
    }
  }, [expiredReason, onExpired]);

  const sendHeartbeat = useCallback(async () => {
    try {
      const response = await fetch("/api/gate/heartbeat", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 410 || response.status === 401) {
          onExpired?.();
          return;
        }
        return;
      }

      const data = await response.json();

      // Check for status change
      if (lastStatus.current && lastStatus.current !== data.status) {
        onStatusChange?.(data.status);

        // Check for promotion
        if (lastStatus.current === "QUEUED" && data.status === "ACTIVE") {
          onPromoted?.();
        }
      }

      lastStatus.current = data.status;

      // Report queue position if queued
      if (data.status === "QUEUED" && data.queuePosition !== undefined) {
        onQueuePositionChange?.(data.queuePosition);
      }

      // Report occupancy (only if not getting WebSocket updates)
      if (!isConnected) {
        onOccupancyChange?.({
          activeCount: data.activeCount,
          capacity: data.capacity,
        });
      }
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  }, [onStatusChange, onOccupancyChange, onPromoted, onExpired, isConnected]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval (always poll for session keep-alive, even with WebSocket)
    intervalRef.current = setInterval(sendHeartbeat, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, sendHeartbeat]);

  // This component doesn't render anything
  return null;
}
