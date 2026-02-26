# Event Horizon Gallery

A monochrome, museum-style portfolio website with capacity-limited access. Built with Next.js App Router, TypeScript, Tailwind CSS, and Prisma.

## Features

### Gate (Capacity-Limited Entry)
- **Sign-in required**: Every visitor signs the ledger before accessing the library
- **200 concurrent visitors max**: ACTIVE sessions limited to heartbeat window (90s)
- **FIFO queue**: When full, new visitors are queued and promoted when slots open
- **Real-time status**: Live occupancy count and queue position updates
- **Iron-sealed tokens**: Edge-compatible session tokens stored as httpOnly cookies

### Gallery (Coming Next)
- **Exhibits**: Skill categories with curated placards
- **Artifacts**: Projects within exhibits with metrics and proof
- **Museum design**: Measurement frames, calibration motions, monochrome palette

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client and create SQLite database
npx prisma generate
npx prisma db push

# Start development server (standard)
npm run dev

# Or start with WebSocket support for realtime updates
npm run dev:ws
```

Visit [http://localhost:3000](http://localhost:3000) to see the Gate.

## Project Structure

```
event-horizon/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite dev, Postgres prod)
├── src/
│   ├── app/
│   │   ├── api/gate/          # Gate API routes
│   │   │   ├── checkin/       # POST - Sign the ledger
│   │   │   ├── heartbeat/     # POST - Keep session alive
│   │   │   ├── exit/          # POST - Leave library
│   │   │   └── status/        # GET - Occupancy & session status
│   │   ├── gate/              # Gate UI (sign-in, waiting, granted)
│   │   ├── library/           # Protected gallery pages
│   │   ├── globals.css        # Design system styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Redirect to /gate
│   ├── components/
│   │   ├── Gate/              # Gate-specific components
│   │   │   ├── LedgerForm.tsx
│   │   │   ├── QueueTicker.tsx
│   │   │   ├── HeartbeatClient.tsx
│   │   │   └── GrantedPass.tsx
│   │   ├── MeasureFrame.tsx   # Signature museum motif
│   │   ├── Placard.tsx        # Museum-style label
│   │   ├── StatusBadge.tsx
│   │   ├── OccupancyBadge.tsx
│   │   └── CalibrationLine.tsx
│   ├── domain/
│   │   ├── gallery/           # Exhibit/Artifact types
│   │   └── gate/              # Session types
│   ├── lib/
│   │   ├── auth/              # Iron token sealing/verification
│   │   ├── config/            # Environment configuration
│   │   ├── gate/              # Occupancy, queue, rate limiting
│   │   ├── validation/        # Zod schemas
│   │   ├── ws/                # WebSocket types and client
│   │   └── prisma.ts          # Prisma client singleton
│   └── proxy.ts               # Edge proxy for /library protection
├── .env                       # Environment variables
├── tailwind.config.ts         # Design tokens
└── package.json
```

## Gate Flow

1. **ARRIVAL**: Visitor lands on `/gate`, sees occupancy count
2. **CHECK-IN**: Submit name (required), email, purpose via LedgerForm
3. **VERIFICATION**: Server checks capacity, creates session
4. **GRANTED**: If room, session is ACTIVE → can enter `/library`
5. **WAITING**: If full, session is QUEUED → shows queue position
6. **INSIDE**: HeartbeatClient pings every 20s to keep session alive

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gate/checkin` | POST | Sign the ledger, get pass token |
| `/api/gate/heartbeat` | POST | Keep session alive, check for promotion |
| `/api/gate/exit` | POST | Leave library, free slot |
| `/api/gate/status` | GET | Get occupancy and session status |

## Environment Variables

```env
# Iron secret for token signing (min 32 chars)
IRON_SECRET="your-secret-here"

# Database URL
DATABASE_URL="file:./dev.db"        # SQLite for dev
# DATABASE_URL="postgresql://..."   # Postgres for prod
```

## Configuration

Edit [src/lib/config/env.ts](src/lib/config/env.ts) to adjust:

- `capacity`: Max concurrent visitors (default: 200)
- `heartbeatWindowMs`: Session timeout (default: 90s)
- `heartbeatIntervalMs`: Client ping interval (default: 20s)
- `rateLimitMaxRequests`: Check-ins per IP per window (default: 5)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite (dev) / Postgres (prod)
- **Auth**: @hapi/iron (sealed tokens)
- **Validation**: Zod
- **Animation**: Framer Motion
- **WebSocket**: ws (server), native WebSocket (client)

## The 157 Triad

The esoteric messaging system:
- **1 (Initiation)**: Identity and intent
- **5 (Transition)**: Capacity and change
- **7 (Alignment)**: Entry with focus

## Next Steps

- [x] Add WebSocket server for real-time updates
- [ ] Build Gallery exhibits and artifacts
- [ ] Add content data layer
- [ ] Implement archive page with search/filter
- [ ] Add OG image generation

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Standard Next.js dev server |
| `npm run dev:ws` | Custom server with WebSocket support |
| `npm run build` | Production build |
| `npm run start` | Production server (no WS) |
| `npm run start:ws` | Production server with WebSocket |

## WebSocket API

When running with `dev:ws` or `start:ws`, a WebSocket server is available at `/ws`.

### Messages (Server → Client)

```typescript
// Occupancy update (broadcast to all)
{ type: "occupancy", activeCount: number, capacity: number, queueLength: number }

// Promotion notification (to specific session)
{ type: "promoted", tokenHash: string }

// Server ping (expects pong response)
{ type: "ping", nonce: string }
```

### Messages (Client → Server)

```typescript
// Authentication (optional, for targeted notifications)
{ type: "hello", token: string, clientId: string }

// Subscribe to topics
{ type: "subscribe", topics: ["occupancy", "promotion"] }

// Pong response
{ type: "pong", nonce: string }
```

## License

MIT
