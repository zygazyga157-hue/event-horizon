/**
 * Custom Next.js server with WebSocket support
 * Run with: npx ts-node --project tsconfig.server.json server.ts
 */
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { nanoid } from "nanoid";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Connection tracking
interface Connection {
  id: string;
  ws: WebSocket;
  tokenHash?: string;
  subscriptions: Set<string>;
  lastPong: number;
  pingNonce?: string;
}

const connections = new Map<string, Connection>();

// Configuration
const PING_INTERVAL_MS = 30000;
const PONG_TIMEOUT_MS = 10000;

// Message helpers
function send(ws: WebSocket, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ ts: Date.now(), data }));
  }
}

function broadcast(topic: string, data: unknown) {
  for (const conn of connections.values()) {
    if (conn.subscriptions.has(topic)) {
      send(conn.ws, data);
    }
  }
}

// Exposed for API routes to call
declare global {
  var wsHub: {
    broadcastOccupancy: (activeCount: number, capacity: number, queueLength: number) => void;
    notifyPromoted: (tokenHashes: string[]) => void;
    getConnectionCount: () => number;
  };
}

globalThis.wsHub = {
  broadcastOccupancy(activeCount: number, capacity: number, queueLength: number) {
    broadcast("occupancy", {
      type: "occupancy",
      activeCount,
      capacity,
      queueLength,
    });
  },

  notifyPromoted(tokenHashes: string[]) {
    const hashSet = new Set(tokenHashes);
    for (const conn of connections.values()) {
      if (conn.tokenHash && hashSet.has(conn.tokenHash)) {
        send(conn.ws, { type: "promoted", tokenHash: conn.tokenHash });
      }
    }
  },

  getConnectionCount() {
    return connections.size;
  },
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // WebSocket server on /ws path
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    const connId = nanoid(12);
    const conn: Connection = {
      id: connId,
      ws,
      subscriptions: new Set(["occupancy"]), // Auto-subscribe to occupancy
      lastPong: Date.now(),
    };

    connections.set(connId, conn);
    console.log(`[WS] Client connected: ${connId} (total: ${connections.size})`);

    // Send accept message
    send(ws, {
      type: "accept",
      connId,
      heartbeatIntervalMs: PING_INTERVAL_MS,
    });

    ws.on("message", (rawData) => {
      try {
        const envelope = JSON.parse(rawData.toString());
        const msg = envelope.data || envelope;

        switch (msg.type) {
          case "hello":
            conn.tokenHash = msg.tokenHash;
            conn.subscriptions.add("promotion");
            break;

          case "pong":
            if (msg.nonce === conn.pingNonce) {
              conn.lastPong = Date.now();
            }
            break;

          case "subscribe":
            if (Array.isArray(msg.topics)) {
              msg.topics.forEach((t: string) => conn.subscriptions.add(t));
            }
            break;

          case "unsubscribe":
            if (Array.isArray(msg.topics)) {
              msg.topics.forEach((t: string) => conn.subscriptions.delete(t));
            }
            break;
        }
      } catch {
        // Ignore parse errors
      }
    });

    ws.on("close", () => {
      connections.delete(connId);
      console.log(`[WS] Client disconnected: ${connId} (total: ${connections.size})`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on ${connId}:`, err.message);
    });
  });

  // Ping interval to keep connections alive and detect stale ones
  setInterval(() => {
    const now = Date.now();

    for (const [id, conn] of connections) {
      // Check for stale connections
      if (now - conn.lastPong > PONG_TIMEOUT_MS * 2) {
        console.log(`[WS] Terminating stale connection: ${id}`);
        conn.ws.terminate();
        connections.delete(id);
        continue;
      }

      // Send ping
      const nonce = nanoid(8);
      conn.pingNonce = nonce;
      send(conn.ws, { type: "ping", nonce });
    }
  }, PING_INTERVAL_MS);

  server.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║  Event Horizon Gallery                                    ║
║  ─────────────────────────────────────────────────────── ║
║  HTTP:  http://${hostname}:${port}                             ║
║  WS:    ws://${hostname}:${port}/ws                            ║
║  Mode:  ${dev ? "development" : "production"}                                     ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
});
