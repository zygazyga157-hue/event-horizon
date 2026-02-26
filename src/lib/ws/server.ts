/**
 * WebSocket server hub for Gate realtime updates
 * Manages connections, broadcasts occupancy, and notifies promotions
 */
import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { nanoid } from "nanoid";
import { config } from "@/lib/config";
import {
  WSClientMessage,
  WSServerMessage,
  serializeWSMessage,
  parseWSMessage,
} from "./types";
import { getGateStatus } from "@/lib/gate/occupancy";

interface Connection {
  id: string;
  ws: WebSocket;
  tokenHash?: string;
  subscriptions: Set<string>;
  lastPong: number;
  pingNonce?: string;
}

class GateWSHub {
  private wss: WebSocketServer | null = null;
  private connections = new Map<string, Connection>();
  private pingInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server on an HTTP server
   */
  initialize(server: import("http").Server) {
    if (this.wss) {
      console.warn("WebSocket server already initialized");
      return;
    }

    this.wss = new WebSocketServer({ server, path: "/api/ws" });

    this.wss.on("connection", (ws, req) => this.handleConnection(ws, req));

    // Start ping interval
    this.pingInterval = setInterval(() => this.pingAll(), config.ws.pingIntervalMs);

    console.log("WebSocket server initialized on /api/ws");
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage) {
    const connId = nanoid(12);
    const conn: Connection = {
      id: connId,
      ws,
      subscriptions: new Set(),
      lastPong: Date.now(),
    };

    this.connections.set(connId, conn);

    // Send accept message
    this.send(ws, {
      type: "accept",
      connId,
      heartbeatIntervalMs: config.ws.pingIntervalMs,
    });

    ws.on("message", (data) => this.handleMessage(conn, data.toString()));
    ws.on("close", () => this.handleClose(conn));
    ws.on("error", (err) => console.error(`WS error [${connId}]:`, err));

    // Send initial occupancy
    this.sendOccupancy(ws);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(conn: Connection, raw: string) {
    const msg = parseWSMessage(raw);
    if (!msg) return;

    switch (msg.type) {
      case "hello":
        // Client authenticating
        conn.tokenHash = msg.token;
        conn.subscriptions.add("occupancy");
        conn.subscriptions.add("promotion");
        break;

      case "pong":
        if (msg.nonce === conn.pingNonce) {
          conn.lastPong = Date.now();
        }
        break;

      case "subscribe":
        msg.topics.forEach((t) => conn.subscriptions.add(t));
        break;

      case "subscribe_auction":
        // Subscribe to auction updates
        conn.subscriptions.add(`auction:${msg.auctionId}`);
        break;

      case "unsubscribe_auction":
        // Unsubscribe from auction updates
        conn.subscriptions.delete(`auction:${msg.auctionId}`);
        break;
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(conn: Connection) {
    this.connections.delete(conn.id);
  }

  /**
   * Send message to a WebSocket
   */
  private send(ws: WebSocket, message: WSServerMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(serializeWSMessage(message));
    }
  }

  /**
   * Send current occupancy to a single client
   */
  private async sendOccupancy(ws: WebSocket) {
    const status = await getGateStatus();
    this.send(ws, {
      type: "occupancy",
      activeCount: status.activeCount,
      capacity: status.capacity,
      queueLength: status.queueLength,
    });
  }

  /**
   * Ping all connections
   */
  private pingAll() {
    const now = Date.now();
    const timeout = config.ws.pongTimeoutMs;

    for (const [id, conn] of this.connections) {
      // Check for stale connections
      if (now - conn.lastPong > timeout * 2) {
        conn.ws.terminate();
        this.connections.delete(id);
        continue;
      }

      // Send ping
      const nonce = nanoid(8);
      conn.pingNonce = nonce;
      this.send(conn.ws, { type: "ping", nonce });
    }
  }

  /**
   * Broadcast occupancy update to all subscribed clients
   */
  async broadcastOccupancy() {
    const status = await getGateStatus();
    const message: WSServerMessage = {
      type: "occupancy",
      activeCount: status.activeCount,
      capacity: status.capacity,
      queueLength: status.queueLength,
    };

    for (const conn of this.connections.values()) {
      if (conn.subscriptions.has("occupancy")) {
        this.send(conn.ws, message);
      }
    }
  }

  /**
   * Notify specific token hashes that they've been promoted
   */
  notifyPromoted(tokenHashes: string[]) {
    const hashSet = new Set(tokenHashes);

    for (const conn of this.connections.values()) {
      if (conn.tokenHash && hashSet.has(conn.tokenHash)) {
        this.send(conn.ws, { type: "promoted", tokenHash: conn.tokenHash });
      }
    }
  }

  /**
   * Broadcast message to all connections subscribed to a topic
   */
  broadcastToTopic(topic: string, message: WSServerMessage) {
    for (const conn of this.connections.values()) {
      if (conn.subscriptions.has(topic)) {
        this.send(conn.ws, message);
      }
    }
  }

  /**
   * Broadcast auction state update
   */
  broadcastAuctionUpdate(auctionId: string, state: {
    status: string;
    currentBid: number | null;
    bidCount: number;
    leadingBidderName: string | null;
    endsAt: string | null;
  }) {
    this.broadcastToTopic(`auction:${auctionId}`, {
      type: "auction_state",
      auctionId,
      ...state,
    });
  }

  /**
   * Broadcast auction ended
   */
  broadcastAuctionEnded(auctionId: string, winningBid: number | null, winnerName: string | null) {
    this.broadcastToTopic(`auction:${auctionId}`, {
      type: "auction_ended",
      auctionId,
      winningBid,
      winnerName,
    });
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Shutdown
   */
  shutdown() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Singleton instance
export const gateWSHub = new GateWSHub();
