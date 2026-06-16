-- Increase USDT precision for wallet balances and transactions (BRL FX conversion).

ALTER TABLE "User" ALTER COLUMN "totalBalance" TYPE DECIMAL(18, 6);

ALTER TABLE "Wallet" ALTER COLUMN "balance" TYPE DECIMAL(18, 6);

ALTER TABLE "Transaction" ALTER COLUMN "amount" TYPE DECIMAL(18, 6);

ALTER TABLE "PortfolioSnapshot" ALTER COLUMN "totalValue" TYPE DECIMAL(18, 6);
ALTER TABLE "PortfolioSnapshot" ALTER COLUMN "investedValue" TYPE DECIMAL(18, 6);
