-- Credit card invoice lifecycle
ALTER TABLE "Card" ADD COLUMN "dueDay" INTEGER NOT NULL DEFAULT 10;

CREATE TABLE "CreditCardPurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "installmentsCount" INTEGER NOT NULL,
  "category" TEXT,
  "categoryId" TEXT,
  "purchaseDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreditCardPurchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreditCardInvoice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "monthKey" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'open',
  "paidAt" TIMESTAMP(3),
  "transactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreditCardInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreditCardInstallment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "monthKey" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "installmentNumber" INTEGER NOT NULL,
  "installmentsTotal" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreditCardInstallment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditCardInvoice_cardId_monthKey_key" ON "CreditCardInvoice"("cardId", "monthKey");
CREATE INDEX "CreditCardPurchase_userId_purchaseDate_idx" ON "CreditCardPurchase"("userId", "purchaseDate" DESC);
CREATE INDEX "CreditCardPurchase_cardId_purchaseDate_idx" ON "CreditCardPurchase"("cardId", "purchaseDate" DESC);
CREATE INDEX "CreditCardInstallment_userId_monthKey_idx" ON "CreditCardInstallment"("userId", "monthKey");
CREATE INDEX "CreditCardInstallment_cardId_monthKey_idx" ON "CreditCardInstallment"("cardId", "monthKey");
CREATE INDEX "CreditCardInstallment_invoiceId_idx" ON "CreditCardInstallment"("invoiceId");
CREATE INDEX "CreditCardInstallment_purchaseId_idx" ON "CreditCardInstallment"("purchaseId");
CREATE INDEX "CreditCardInvoice_userId_monthKey_idx" ON "CreditCardInvoice"("userId", "monthKey");
CREATE INDEX "CreditCardInvoice_transactionId_idx" ON "CreditCardInvoice"("transactionId");

ALTER TABLE "CreditCardPurchase" ADD CONSTRAINT "CreditCardPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardPurchase" ADD CONSTRAINT "CreditCardPurchase_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInvoice" ADD CONSTRAINT "CreditCardInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInvoice" ADD CONSTRAINT "CreditCardInvoice_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInvoice" ADD CONSTRAINT "CreditCardInvoice_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CreditCardInstallment" ADD CONSTRAINT "CreditCardInstallment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInstallment" ADD CONSTRAINT "CreditCardInstallment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInstallment" ADD CONSTRAINT "CreditCardInstallment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "CreditCardPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CreditCardInstallment" ADD CONSTRAINT "CreditCardInstallment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "CreditCardInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
