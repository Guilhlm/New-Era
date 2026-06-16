-- CreateEnum
CREATE TYPE "InvestmentLastAction" AS ENUM ('BUY', 'SELL');

-- AlterEnum
ALTER TYPE "InvestmentType" ADD VALUE 'ETF';

-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "ticker" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shares" DECIMAL(18,6) NOT NULL DEFAULT 0,
ADD COLUMN     "avgPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "currentPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lastAction" "InvestmentLastAction" NOT NULL DEFAULT 'BUY';

-- CreateIndex
CREATE INDEX "Investment_userId_ticker_idx" ON "Investment"("userId", "ticker");

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalValue" DECIMAL(12,2) NOT NULL,
    "investedValue" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_userId_date_idx" ON "PortfolioSnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSnapshot_userId_date_key" ON "PortfolioSnapshot"("userId", "date");

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill ticker from name for existing rows
UPDATE "Investment" SET "ticker" = UPPER(LEFT(REPLACE("name", ' ', ''), 12)) WHERE "ticker" = '';
