/**
 * React hook for Gate WebSocket connection
 */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { GateWSClient, getGateWSUrl } from "@/lib/ws/client";

export interface UseGateWSOptions {
  /** Token for authenticated connection */
  token?: string;
  /** Enable auto-connect on mount */
  autoConnect?: boolean;
}

export interface GateWSState {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Current occupancy from server */
  occupancy: {
    activeCount: number;
    capacity: number;
    queueLength: number;
  } | null;
  /** Whether user was just promoted */
  wasPromoted: boolean;
  /** Reason for expiration (if expired) */
  expiredReason: string | null;
}

export function useGateWS(options: UseGateWSOptions = {}) {
  const { token, autoConnect = true } = options;
  const clientRef = useRef<GateWSClient | null>(null);
  
  const [state, setState] = useState<GateWSState>({
    isConnected: false,
    occupancy: null,
    wasPromoted: false,
    expiredReason: null,
  });

  const connect = useCallback(() => {
    if (clientRef.current?.isConnected()) return;
    
    clientRef.current = new GateWSClient({
      url: getGateWSUrl(),
      token,
      onConnect: () => {
        setState((prev) => ({ ...prev, isConnected: true }));
      },
      onDisconnect: () => {
        setState((prev) => ({ ...prev, isConnected: false }));
      },
      onOccupancy: (data) => {
        setState((prev) => ({ ...prev, occupancy: data }));
      },
      onPromoted: () => {
        setState((prev) => ({ ...prev, wasPromoted: true }));
      },
      onExpired: (reason) => {
        setState((prev) => ({ ...prev, expiredReason: reason }));
      },
    });
    
    clientRef.current.connect();
  }, [token]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    setState((prev) => ({ ...prev, isConnected: false }));
  }, []);

  const clearPromoted = useCallback(() => {
    setState((prev) => ({ ...prev, wasPromoted: false }));
  }, []);

  const clearExpired = useCallback(() => {
    setState((prev) => ({ ...prev, expiredReason: null }));
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    clearPromoted,
    clearExpired,
  };
}
