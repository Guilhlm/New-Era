-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('CASH', 'BANK', 'CRYPTO');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "InvestmentType" AS ENUM ('STOCK', 'REIT', 'CRYPTO', 'FIXED_INCOME', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "photoUser" TEXT,
    "themePreference" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "cpf" TEXT,
    "monthlyIncome" DECIMAL(12,2),
    "disciplineLevel" INTEGER,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "totalBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMeasure" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(6,2),
    "calfRight" DECIMAL(6,2),
    "calfLeft" DECIMAL(6,2),
    "quadRight" DECIMAL(6,2),
    "quadLeft" DECIMAL(6,2),
    "waist" DECIMAL(6,2),
    "abdomen" DECIMAL(6,2),
    "back" DECIMAL(6,2),
    "chest" DECIMAL(6,2),
    "shoulderCircumference" DECIMAL(6,2),
    "neckCircumference" DECIMAL(6,2),
    "bicepsRight" DECIMAL(6,2),
    "bicepsLeft" DECIMAL(6,2),
    "forearmRight" DECIMAL(6,2),
    "forearmLeft" DECIMAL(6,2),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyVital" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bodyFat" DECIMAL(6,2),
    "bodyWater" DECIMAL(6,2),
    "leanMass" DECIMAL(6,2),
    "boneMass" DECIMAL(6,2),
    "restingHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "basalMetabolicRate" INTEGER,
    "hydrationLevel" DECIMAL(6,2),
    "sleepHours" DECIMAL(4,2),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyVital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessMacroGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fats" DECIMAL(8,2),
    "carbodrate" DECIMAL(8,2),
    "protein" DECIMAL(8,2),
    "weightGoal" DECIMAL(8,2),
    "calories" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessMacroGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietMeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER,
    "mealDate" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "mealTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietFoodItem" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalGrams" DECIMAL(8,2),
    "calories" INTEGER,
    "fats" DECIMAL(8,2),
    "protein" DECIMAL(8,2),
    "carbodrate" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietFoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "waterTotal" DECIMAL(8,2),
    "waterIntake" DECIMAL(8,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER,
    "nameTraining" TEXT NOT NULL,
    "timeMinutes" INTEGER,
    "nameMuscle" TEXT,
    "totalKilos" DECIMAL(8,2),
    "numberSeries" INTEGER,
    "numberRepetions" INTEGER,
    "isPrimaryMuscle" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "type" "WalletType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameCard" TEXT NOT NULL,
    "limitTotal" DECIMAL(12,2),
    "limitUsage" DECIMAL(12,2),
    "type" "CardType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT,
    "fixed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "costValue" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "BodyMeasure_userId_recordedAt_idx" ON "BodyMeasure"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "BodyVital_userId_recordedAt_idx" ON "BodyVital"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "FitnessMacroGoal_userId_idx" ON "FitnessMacroGoal"("userId");

-- CreateIndex
CREATE INDEX "DietMeal_userId_mealDate_idx" ON "DietMeal"("userId", "mealDate");

-- CreateIndex
CREATE INDEX "DietFoodItem_mealId_idx" ON "DietFoodItem"("mealId");

-- CreateIndex
CREATE INDEX "WaterLog_userId_logDate_idx" ON "WaterLog"("userId", "logDate");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_weekday_idx" ON "WorkoutSession"("userId", "weekday");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- CreateIndex
CREATE INDEX "FinancialGoal_userId_deadline_idx" ON "FinancialGoal"("userId", "deadline");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_idx" ON "MonthlyExpense"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "Investment_userId_type_idx" ON "Investment"("userId", "type");

-- AddForeignKey
ALTER TABLE "BodyMeasure" ADD CONSTRAINT "BodyMeasure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BodyVital" ADD CONSTRAINT "BodyVital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitnessMacroGoal" ADD CONSTRAINT "FitnessMacroGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietMeal" ADD CONSTRAINT "DietMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietFoodItem" ADD CONSTRAINT "DietFoodItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "DietMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialGoal" ADD CONSTRAINT "FinancialGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyExpense" ADD CONSTRAINT "MonthlyExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
