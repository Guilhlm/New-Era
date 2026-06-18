-- Dynamic finance domains: monthly expenses, goals, notifications

DO $$ BEGIN
  CREATE TYPE "NotificationPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationKind" AS ENUM ('ALERT', 'REMINDER', 'INSIGHT', 'UPDATE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationPriority" AS ENUM ('URGENT', 'NORMAL', 'LOW');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "NotificationCategory" AS ENUM (
    'TASKS',
    'FINANCE',
    'GOALS',
    'WALLET',
    'DIET',
    'TRAINING',
    'BODY',
    'SYSTEM'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MonthlyExpenseCategory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "budget" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "isLocked" BOOLEAN NOT NULL DEFAULT false,
  "systemKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MonthlyExpenseCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FinancialGoalActivity" (
  "id" TEXT NOT NULL,
  "goalId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FinancialGoalActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" "NotificationCategory" NOT NULL,
  "kind" "NotificationKind" NOT NULL,
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "period" "NotificationPeriod" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "href" TEXT,
  "ctaLabel" TEXT,
  "dedupeKey" TEXT,
  "metadata" JSONB,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Card"
  ADD COLUMN IF NOT EXISTS "holderName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastFour" TEXT,
  ADD COLUMN IF NOT EXISTS "brand" TEXT,
  ADD COLUMN IF NOT EXISTS "color" TEXT;

ALTER TABLE "FinancialGoal"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "systemKey" TEXT;

ALTER TABLE "MonthlyExpense"
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT,
  ADD COLUMN IF NOT EXISTS "transactionId" TEXT,
  ADD COLUMN IF NOT EXISTS "monthKey" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'paid';

CREATE UNIQUE INDEX IF NOT EXISTS "MonthlyExpenseCategory_userId_name_key"
  ON "MonthlyExpenseCategory"("userId", "name");
CREATE INDEX IF NOT EXISTS "MonthlyExpenseCategory_userId_isSystem_idx"
  ON "MonthlyExpenseCategory"("userId", "isSystem");
CREATE INDEX IF NOT EXISTS "MonthlyExpenseCategory_userId_systemKey_idx"
  ON "MonthlyExpenseCategory"("userId", "systemKey");

CREATE INDEX IF NOT EXISTS "FinancialGoal_userId_isSystem_idx"
  ON "FinancialGoal"("userId", "isSystem");
CREATE INDEX IF NOT EXISTS "FinancialGoal_userId_systemKey_idx"
  ON "FinancialGoal"("userId", "systemKey");

CREATE INDEX IF NOT EXISTS "MonthlyExpense_userId_monthKey_idx"
  ON "MonthlyExpense"("userId", "monthKey");
CREATE INDEX IF NOT EXISTS "MonthlyExpense_userId_categoryId_idx"
  ON "MonthlyExpense"("userId", "categoryId");

CREATE INDEX IF NOT EXISTS "FinancialGoalActivity_goalId_createdAt_idx"
  ON "FinancialGoalActivity"("goalId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "FinancialGoalActivity_userId_createdAt_idx"
  ON "FinancialGoalActivity"("userId", "createdAt" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "Notification_userId_dedupeKey_key"
  ON "Notification"("userId", "dedupeKey");
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx"
  ON "Notification"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Notification_userId_read_createdAt_idx"
  ON "Notification"("userId", "read", "createdAt" DESC);

DO $$ BEGIN
  ALTER TABLE "MonthlyExpenseCategory"
    ADD CONSTRAINT "MonthlyExpenseCategory_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "FinancialGoalActivity"
    ADD CONSTRAINT "FinancialGoalActivity_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "FinancialGoalActivity"
    ADD CONSTRAINT "FinancialGoalActivity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MonthlyExpense"
    ADD CONSTRAINT "MonthlyExpense_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "MonthlyExpenseCategory"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "MonthlyExpense"
    ADD CONSTRAINT "MonthlyExpense_transactionId_fkey"
    FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
