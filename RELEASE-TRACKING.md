# EVENT HORIZON — Release Tracking & Deployment Plan

**Version**: v1.0.0 (Public Gallery) → v1.1.0 (Admin Complete)  
**Updated**: 2026-02-01  
**Status**: Preparing v1.0.0 for deployment

---

## Release Strategy

### v1.0.0 — Public Gallery (Current Target)
Ship the visitor-facing gallery experience. Admin features are hidden/disabled.

### v1.1.0 — Admin Dashboard
Complete admin authentication flow and auction management.

---

## v1.0.0 — Feature Completion Status

### ✅ COMPLETE — Ready for v1.0.0

#### Core Infrastructure
- [x] Next.js 16 App Router with Turbopack
- [x] Prisma ORM with SQLite (dev) / PostgreSQL ready
- [x] Iron-sealed authentication tokens
- [x] Content security headers (CSP, HSTS, etc.)
- [x] WebSocket server for real-time updates

#### Gate System (Visitor Authentication)
- [x] Capacity-limited entry (200 max)
- [x] Ledger sign-in form with purpose selection
- [x] Calibration animation during verification
- [x] FIFO queue with position tracking
- [x] Heartbeat session keep-alive (20s interval)
- [x] Real-time WebSocket occupancy updates
- [x] Queue promotion with transition animation
- [x] Session expiration handling
- [x] 157 Triad esoteric messaging

#### Library (Public Gallery)
- [x] Atrium home page with exhibit grid
- [x] Availability strip (status, focus, last update)
- [x] Filter bar (search, status, tags)
- [x] Exhibit cards with status badges
- [x] Dynamic exhibit pages (`/library/exhibits/[slug]`)
- [x] Placard sections (what/why/approach)
- [x] Artifact cards with stack tags
- [x] Roadmap timeline with completion status
- [x] Media panel (images, video embeds, audio)
- [x] Audio player with WaveSurfer.js waveforms
- [x] Document reader for PDFs/images

#### Archive Page
- [x] Cross-exhibit artifact listing
- [x] Sorting (recency, status, exhibit)
- [x] Filtering (exhibit, status, stack)
- [x] Artifact detail modal

#### About Page
- [x] Curator bio and principles
- [x] Skills snapshot
- [x] Career timeline
- [x] Floating support dock
- [x] PayPal + Crypto donation panel
- [x] QR code generation for crypto addresses

#### Contact Page
- [x] Availability status display
- [x] Contact form with Zod validation
- [x] Honeypot spam protection
- [x] Email outbox queue
- [x] Work opportunities section
- [x] Industries/deliverables listing

#### Components
- [x] MeasureFrame (signature corner brackets)
- [x] StatusBadge (Shipped/In Progress/Research)
- [x] OccupancyBadge (live count display)
- [x] CalibrationLine animation
- [x] Toast notifications with backdrop blur
- [x] Placard component
- [x] LibraryHeader/LibraryFooter

#### Auction System (Display Only for v1.0)
- [x] ExhibitAuctionPanel (visitor-facing)
- [x] AuctionCard with countdown
- [x] AuctionStatusBadge
- [x] AuctionCountdown timer
- [x] BiddingModal (form + validation)
- [x] Bid submission API
- [x] Prisma models (Auction, Bid, AuctionState)

---

### 🔶 PARTIAL — Needs Fixes for v1.0.0

#### Admin Authentication Flow
- [x] Admin passkey email sending
- [x] Passkey verification API
- [x] Admin session creation with `isAdmin: true`
- [ ] **BUG**: Admin redirect loop after passkey verification
  - After passkey success, admin sees "Pass Granted" but clicking "Cross the Threshold" redirects back to `/gate`
  - Root cause: Session cookie conflict or layout validation timing issue
  - **Workaround for v1.0**: Disable admin access, use direct DB access

#### Tailwind v4 Warnings (Non-blocking)
These are style suggestions, not errors:
- [x] `flex-shrink-0` → `shrink-0` (fixed)
- [x] `bg-gradient-to-r` → `bg-linear-to-r` (fixed)
- [x] `z-[99]` → `z-99`, `z-[100]` → `z-100` (fixed)

#### SEO Implementation
- [x] robots.ts blocking /admin, /gate, /api, /ws
- [x] sitemap.ts excludes /gate (noindex zone)
- [x] Gate layout has noindex meta
- [x] Admin layout has noindex meta
- [x] JSON-LD Person schema on About page
- [x] JSON-LD CollectionPage schema on Library page
- [x] JSON-LD ContactPage schema on Contact page
- [x] JSON-LD CreativeWork schema on Exhibit pages
- [x] OpenGraph meta configured globally
- [x] Twitter card meta configured
- [x] PNG favicon assets (favicon.ico, favicon-16x16.png, favicon-32x32.png)
- [x] Apple touch icon (apple-touch-icon.png)
- [x] Android chrome icons (192x192, 512x512)
- [ ] **PRE-DEPLOY**: Create og-image.png from SVG (1200×630)
- [ ] Verify with Google Rich Results Test
- [ ] Submit sitemap to Google Search Console

#### Service Workers & PWA
- [x] public/sw.js with cache + offline fallback
- [x] public/offline.html with 157 SIGNAL LOST branding
- [x] ServiceWorkerRegister component
- [x] SW integrated into root layout
- [x] manifest.json with app icons
- [x] site.webmanifest configured

#### Backend Workers (Prisma)
- [x] Email outbox worker (`npm run workers:outbox`)
- [x] Session cleanup worker (`npm run workers:cleanup`)
- [x] Combined worker runner (`npm run workers`)
- [ ] **PRE-DEPLOY**: Set up worker process in production (pm2/systemd)

---

### ❌ NOT STARTED — Deferred to v1.1.0

#### Admin Dashboard
- [ ] Admin layout authentication fix
- [ ] Dashboard stats page (working, but blocked by auth)
- [ ] Auctions list page (working, but blocked by auth)
- [ ] Auction detail management
- [ ] Auction controls (start/pause/end/extend)
- [ ] Bid management and winner selection
- [ ] Invoice generation
- [ ] Email notification triggers
- [ ] Audit log viewer

#### Admin API Routes
- [x] `PATCH /api/admin/auctions/[slug]` — Status actions
- [x] `POST /api/admin/auctions/[slug]/sync` — Sync from content
- [x] `POST /api/admin/auctions/[slug]/invoice` — Generate invoice
- [ ] Bids management endpoints
- [ ] Email management endpoints

---

## v1.0.0 Pre-Deployment Checklist

### Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication  
IRON_SECRET="32+ character random string"

# Gate System
GATE_CAPACITY=200
GATE_TOKEN_TTL_MS=86400000
GATE_HEARTBEAT_WINDOW_MS=90000

# Admin
ADMIN_EMAIL="admin@example.com"

# Email (for contact form)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="password"
EMAIL_FROM="noreply@example.com"

# Support (optional)
NEXT_PUBLIC_PAYPAL_DONATE_URL=""
NEXT_PUBLIC_BTC_ADDRESS=""
NEXT_PUBLIC_BCH_ADDRESS=""
```

### Build Verification
- [x] Run `npm run build` successfully ✓
- [x] No TypeScript errors ✓
- [x] All pages generate static/dynamic correctly ✓
- [ ] Database migrations applied (`npx prisma db push`)

### Content Verification
- [ ] All exhibit content populated in `content/exhibits.ts`
- [ ] All artifact media files in `public/` directory
- [ ] Copy text proofread
- [ ] Links verified (repos, demos, external)

### Security Checks
- [ ] Remove `/api/debug/session` route before production
- [ ] Verify CSP headers working
- [ ] Test rate limiting on forms
- [ ] Verify honeypot fields work

### Functionality Testing
- [ ] Gate → Check-in → Granted → Library flow
- [ ] Heartbeat maintains session
- [ ] Queue works when at capacity
- [ ] Session expires after inactivity
- [ ] All exhibit pages render
- [ ] Media players work (audio waveforms, video)
- [ ] Contact form submits
- [ ] Support dock opens/closes
- [ ] Toast notifications appear with blur backdrop

---

## v1.0.0 Deployment Notes

### Admin Access Workaround
Since admin authentication has a redirect loop issue, for v1.0:
1. Admin features are built but inaccessible via UI
2. Use Prisma Studio or direct DB access for auction management
3. Run `npx prisma studio` locally to manage data

### Hidden Routes
These routes exist but are not linked in navigation:
- `/admin` — Dashboard (blocked by auth bug)
- `/admin/auctions` — Auction list
- `/admin/auctions/[slug]` — Auction detail

---

## v1.1.0 — Admin Complete (Next Release)

### Priority Fixes
1. **Admin auth flow** — Debug the 307 redirect loop
   - Investigate cookie race condition
   - Check if heartbeat interferes with new session
   - Consider using a separate admin cookie name
   
2. **Admin route protection** — Ensure layout.tsx properly validates

### New Features
1. Complete auction lifecycle management
2. Bid approval/rejection workflow
3. Invoice PDF generation
4. Email notification sending (winner, outbid, etc.)
5. Audit log viewer
6. Session management (force logout, view active)

---

## File Structure Reference

```
src/
├── app/
│   ├── admin/                    # Admin dashboard (v1.1)
│   │   ├── layout.tsx           # Protected layout (has bug)
│   │   ├── page.tsx             # Dashboard stats
│   │   └── auctions/
│   │       ├── page.tsx         # Auction list
│   │       └── [slug]/
│   │           ├── page.tsx     # Auction detail
│   │           └── AuctionControls.tsx
│   ├── api/
│   │   ├── admin/auctions/      # Admin auction APIs
│   │   ├── auctions/            # Public auction APIs
│   │   ├── contact/             # Contact form API
│   │   ├── debug/               # ⚠️ Remove for production
│   │   └── gate/                # Gate/auth APIs
│   ├── gate/                    # Gate (auth) page
│   └── library/                 # Public gallery
│       ├── about/
│       ├── archive/
│       ├── contact/
│       └── exhibits/[slug]/
├── components/
│   ├── Atrium/                  # Gallery components
│   ├── Auction/                 # Auction UI components
│   ├── Gate/                    # Gate flow components
│   ├── Library/                 # Header/footer
│   ├── MediaPanel/              # Media display
│   ├── MediaPlayer/             # Audio player
│   ├── Support/                 # Donation dock
│   └── Toast/                   # Notifications
├── content/
│   ├── exhibits.ts              # Exhibit data
│   ├── copy.ts                  # Site copy
│   └── support.ts               # Donation config
├── domain/                      # TypeScript types
├── hooks/                       # React hooks
└── lib/                         # Utilities
    ├── auth/                    # Iron tokens, passkey
    ├── gate/                    # Session management
    └── ws/                      # WebSocket
```

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| v1.0.0 | 2026-02-01 | Public gallery release (visitor-facing complete, admin deferred) |
| v0.1.0 | 2026-01-24 | Initial development |

---

End of document.
