-- Performance indexes for finance aggregations and FK lookups.
-- Uses IF NOT EXISTS / DROP IF EXISTS so re-running is safe.

-- Transaction: category-filtered date-range aggregations (summary, notifications,
-- monthly-expense, portfolio reads) and FK lookups on wallet joins.
CREATE INDEX IF NOT EXISTS "Transaction_userId_category_date_idx"
  ON "Transaction" ("userId", "category", "date" DESC);
CREATE INDEX IF NOT EXISTS "Transaction_fromWalletId_idx"
  ON "Transaction" ("fromWalletId");
CREATE INDEX IF NOT EXISTS "Transaction_toWalletId_idx"
  ON "Transaction" ("toWalletId");

-- MonthlyExpense: paid-status totals, createdAt fallback window, linked transaction lookup.
CREATE INDEX IF NOT EXISTS "MonthlyExpense_userId_status_idx"
  ON "MonthlyExpense" ("userId", "status");
CREATE INDEX IF NOT EXISTS "MonthlyExpense_userId_createdAt_idx"
  ON "MonthlyExpense" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "MonthlyExpense_transactionId_idx"
  ON "MonthlyExpense" ("transactionId");

-- Wallet: primary cash/bank wallet lookup by type.
CREATE INDEX IF NOT EXISTS "Wallet_userId_type_idx"
  ON "Wallet" ("userId", "type");

-- WaterLog: redundant index already covered by the unique (userId, logDate) constraint.
DROP INDEX IF EXISTS "WaterLog_userId_logDate_idx";
