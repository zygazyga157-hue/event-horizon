/**
 * WebSocket client helper for Gate realtime updates
 */

export interface WSClientOptions {
  url: string;
  token?: string;
  onOccupancy?: (data: { activeCount: number; capacity: number; queueLength: number }) => void;
  onPromoted?: () => void;
  onExpired?: (reason: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class GateWSClient {
  private ws: WebSocket | null = null;
  private options: WSClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingTimeout: NodeJS.Timeout | null = null;

  constructor(options: WSClientOptions) {
    this.options = options;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(this.options.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.options.onConnect?.();

      // Send hello with token
      if (this.options.token) {
        this.send({
          type: "hello",
          token: this.options.token,
          clientId: this.generateClientId(),
        });
      }

      // Subscribe to topics
      this.send({
        type: "subscribe",
        topics: ["occupancy", "promotion"],
      });
    };

    this.ws.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data);
        const data = envelope.data || envelope;

        switch (data.type) {
          case "occupancy":
            this.options.onOccupancy?.({
              activeCount: data.activeCount,
              capacity: data.capacity,
              queueLength: data.queueLength,
            });
            break;

          case "promoted":
            this.options.onPromoted?.();
            break;

          case "expired":
            this.options.onExpired?.(data.reason);
            break;

          case "ping":
            this.send({ type: "pong", nonce: data.nonce });
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    this.ws.onclose = () => {
      this.options.onDisconnect?.();
      this.attemptReconnect();
    };

    this.ws.onerror = () => {
      // Error handling - will trigger onclose
    };
  }

  private send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ ts: Date.now(), data }));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => this.connect(), delay);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  disconnect() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * Create WebSocket URL for Gate
 */
export function getGateWSUrl(): string {
  const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  return `${protocol}//${host}/api/ws`;
}
