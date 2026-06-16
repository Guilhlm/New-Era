-- Investment USDT precision + FX snapshot fields on transactions

ALTER TABLE "Investment" ALTER COLUMN "avgPrice" TYPE DECIMAL(18, 6);
ALTER TABLE "Investment" ALTER COLUMN "currentPrice" TYPE DECIMAL(18, 6);
ALTER TABLE "Investment" ALTER COLUMN "currentValue" TYPE DECIMAL(18, 6);
ALTER TABLE "Investment" ALTER COLUMN "costValue" TYPE DECIMAL(18, 6);

ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "displayAmount" DECIMAL(18, 6);
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "displayCurrency" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "fxRate" DECIMAL(18, 6);
