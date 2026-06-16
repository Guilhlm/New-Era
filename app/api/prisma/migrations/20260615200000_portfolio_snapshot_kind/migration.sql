-- Portfolio snapshot opening/closing kinds

CREATE TYPE "PortfolioSnapshotKind" AS ENUM ('OPENING', 'CLOSING');

ALTER TABLE "PortfolioSnapshot" ADD COLUMN "kind" "PortfolioSnapshotKind" NOT NULL DEFAULT 'CLOSING';

DROP INDEX IF EXISTS "PortfolioSnapshot_userId_date_key";

CREATE UNIQUE INDEX "PortfolioSnapshot_userId_date_kind_key" ON "PortfolioSnapshot"("userId", "date", "kind");
