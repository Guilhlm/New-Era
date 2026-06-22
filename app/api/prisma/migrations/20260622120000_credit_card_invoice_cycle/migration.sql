-- Credit card invoice cycle: closing date, partial payments, open/closed lifecycle
ALTER TABLE "CreditCardInvoice" ADD COLUMN "closingDate" TIMESTAMP(3);
ALTER TABLE "CreditCardInvoice" ADD COLUMN "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Backfill: paid invoices keep full paidAmount; open ones start at zero
UPDATE "CreditCardInvoice"
SET "paidAmount" = "amount"
WHERE "status" = 'paid';

-- Approximate closingDate as the month before dueDate on closingDay (dueDay + 21, max 28)
UPDATE "CreditCardInvoice" AS inv
SET "closingDate" = (
  DATE_TRUNC('month', inv."dueDate" AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
  - INTERVAL '1 month'
  + (
    LEAST(
      28,
      GREATEST(
        1,
        COALESCE(
          (SELECT c."dueDay" FROM "Card" c WHERE c."id" = inv."cardId"),
          10
        ) + 21
      )
    ) - 1
  ) * INTERVAL '1 day'
)
WHERE inv."closingDate" IS NULL;

-- Legacy "paid" becomes "closed" (cycle ended and settled)
UPDATE "CreditCardInvoice"
SET "status" = 'closed'
WHERE "status" = 'paid';

-- Any invoice without closingDate gets dueDate minus 10 days as fallback
UPDATE "CreditCardInvoice"
SET "closingDate" = "dueDate" - INTERVAL '10 days'
WHERE "closingDate" IS NULL;

ALTER TABLE "CreditCardInvoice" ALTER COLUMN "closingDate" SET NOT NULL;
