-- CreateTable
CREATE TABLE "GateSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tokenHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "queuedAt" DATETIME,
    "enteredAt" DATETIME,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artifactId" TEXT NOT NULL,
    "exhibitSlug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LIVE',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "openingBid" INTEGER NOT NULL,
    "minIncrement" INTEGER NOT NULL,
    "currentBid" INTEGER,
    "leadingBidderId" TEXT,
    "endsAt" DATETIME,
    "antiSnipingSeconds" INTEGER NOT NULL DEFAULT 300,
    "allowedBidTypes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "bidderName" TEXT NOT NULL,
    "bidderEmail" TEXT,
    "bidType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "isWinning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuctionState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auctionId" TEXT NOT NULL,
    "currentBid" INTEGER,
    "leadingName" TEXT,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "endsAt" DATETIME,
    "status" TEXT NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuctionState_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "GateSession_tokenHash_key" ON "GateSession"("tokenHash");

-- CreateIndex
CREATE INDEX "GateSession_status_lastSeenAt_idx" ON "GateSession"("status", "lastSeenAt");

-- CreateIndex
CREATE INDEX "GateSession_status_queuedAt_idx" ON "GateSession"("status", "queuedAt");

-- CreateIndex
CREATE INDEX "GateSession_tokenHash_idx" ON "GateSession"("tokenHash");

-- CreateIndex
CREATE INDEX "Auction_status_idx" ON "Auction"("status");

-- CreateIndex
CREATE INDEX "Auction_endsAt_idx" ON "Auction"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Auction_artifactId_exhibitSlug_key" ON "Auction"("artifactId", "exhibitSlug");

-- CreateIndex
CREATE INDEX "Bid_auctionId_createdAt_idx" ON "Bid"("auctionId", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_bidderId_idx" ON "Bid"("bidderId");

-- CreateIndex
CREATE INDEX "AuctionState_auctionId_capturedAt_idx" ON "AuctionState"("auctionId", "capturedAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");
