-- AlterTable
ALTER TABLE "FinancialGoalActivity" ADD COLUMN "transactionId" TEXT;

-- CreateIndex
CREATE INDEX "FinancialGoalActivity_transactionId_idx" ON "FinancialGoalActivity"("transactionId");
