-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photoUser" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" DATETIME,
    "phone" TEXT,
    "cpf" TEXT,
    "monthlyIncome" DECIMAL,
    "disciplineLevel" INTEGER,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "totalBalance" DECIMAL NOT NULL DEFAULT 0,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "height" DECIMAL,
    "weight" DECIMAL,
    "calfRight" DECIMAL,
    "calfLeft" DECIMAL,
    "quadRight" DECIMAL,
    "quadLeft" DECIMAL,
    "waist" DECIMAL,
    "abdomen" DECIMAL,
    "back" DECIMAL,
    "chest" DECIMAL,
    "shoulderCircumference" DECIMAL,
    "neckCircumference" DECIMAL,
    "bicepsRight" DECIMAL,
    "bicepsLeft" DECIMAL,
    "forearmRight" DECIMAL,
    "forearmLeft" DECIMAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BodyMeasure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyVital" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bodyFat" DECIMAL,
    "bodyWater" DECIMAL,
    "leanMass" DECIMAL,
    "boneMass" DECIMAL,
    "restingHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "basalMetabolicRate" INTEGER,
    "hydrationLevel" DECIMAL,
    "sleepHours" DECIMAL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BodyVital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FitnessMacroGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fats" DECIMAL,
    "carbodrate" DECIMAL,
    "protein" DECIMAL,
    "weightGoal" DECIMAL,
    "calories" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessMacroGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER,
    "mealDate" DATETIME,
    "name" TEXT NOT NULL,
    "mealTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DietMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietFoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalGrams" DECIMAL,
    "externalSource" TEXT,
    "externalFoodId" TEXT,
    "caloriesPer100g" INTEGER,
    "proteinPer100g" DECIMAL,
    "carbsPer100g" DECIMAL,
    "fatsPer100g" DECIMAL,
    "calories" INTEGER,
    "fats" DECIMAL,
    "protein" DECIMAL,
    "carbodrate" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DietFoodItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "DietMeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "logDate" DATETIME NOT NULL,
    "waterTotal" DECIMAL,
    "waterIntake" DECIMAL,
    "glassCount" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutDayPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutDayPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutMuscleGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timeMinutes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutMuscleGroup_dayPlanId_fkey" FOREIGN KEY ("dayPlanId") REFERENCES "WorkoutDayPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipment" TEXT,
    "weightKg" DECIMAL,
    "series" INTEGER,
    "repsMin" INTEGER,
    "repsMax" INTEGER,
    "imageUrl" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutExercise_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "WorkoutMuscleGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nameCard" TEXT NOT NULL,
    "limitTotal" DECIMAL,
    "limitUsage" DECIMAL,
    "dueDay" INTEGER NOT NULL DEFAULT 10,
    "type" TEXT NOT NULL,
    "holderName" TEXT,
    "lastFour" TEXT,
    "brand" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditCardPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "category" TEXT,
    "categoryId" TEXT,
    "purchaseDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditCardPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardPurchase_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditCardInstallment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "monthKey" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "installmentsTotal" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditCardInstallment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardInstallment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardInstallment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "CreditCardPurchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardInstallment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "CreditCardInvoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditCardInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "closingDate" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "paidAt" DATETIME,
    "transactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditCardInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardInvoice_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreditCardInvoice_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" DECIMAL NOT NULL,
    "currentAmount" DECIMAL NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "systemKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinancialGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "category" TEXT,
    "categoryId" TEXT,
    "transactionId" TEXT,
    "monthKey" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'paid',
    "fixed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MonthlyExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonthlyExpenseCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MonthlyExpense_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyExpenseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" DECIMAL NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "systemKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyExpenseCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "displayAmount" DECIMAL,
    "displayCurrency" TEXT,
    "fxRate" DECIMAL,
    "description" TEXT,
    "category" TEXT,
    "fromWalletId" TEXT,
    "toWalletId" TEXT,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "shares" DECIMAL NOT NULL DEFAULT 0,
    "avgPrice" DECIMAL NOT NULL DEFAULT 0,
    "currentPrice" DECIMAL NOT NULL DEFAULT 0,
    "currentValue" DECIMAL NOT NULL,
    "costValue" DECIMAL,
    "lastAction" TEXT NOT NULL DEFAULT 'BUY',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'CLOSING',
    "totalValue" DECIMAL NOT NULL,
    "investedValue" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "logDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DailyTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinancialGoalActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "source" TEXT,
    "transactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FinancialGoalActivity_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FinancialGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinancialGoalActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "period" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "href" TEXT,
    "ctaLabel" TEXT,
    "dedupeKey" TEXT,
    "metadata" JSONB,
    "readAt" DATETIME,
    "archivedAt" DATETIME,
    "snoozedUntil" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "BodyMeasure_userId_recordedAt_idx" ON "BodyMeasure"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "BodyVital_userId_recordedAt_idx" ON "BodyVital"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "FitnessMacroGoal_userId_updatedAt_idx" ON "FitnessMacroGoal"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "DietMeal_userId_mealDate_idx" ON "DietMeal"("userId", "mealDate");

-- CreateIndex
CREATE INDEX "DietMeal_userId_weekday_isActive_idx" ON "DietMeal"("userId", "weekday", "isActive");

-- CreateIndex
CREATE INDEX "DietFoodItem_mealId_idx" ON "DietFoodItem"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "WaterLog_userId_logDate_key" ON "WaterLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDayPlan_userId_weekday_key" ON "WorkoutDayPlan"("userId", "weekday");

-- CreateIndex
CREATE INDEX "WorkoutMuscleGroup_dayPlanId_sortOrder_idx" ON "WorkoutMuscleGroup"("dayPlanId", "sortOrder");

-- CreateIndex
CREATE INDEX "WorkoutExercise_groupId_sortOrder_idx" ON "WorkoutExercise"("groupId", "sortOrder");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_userId_type_idx" ON "Wallet"("userId", "type");

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- CreateIndex
CREATE INDEX "CreditCardPurchase_userId_purchaseDate_idx" ON "CreditCardPurchase"("userId", "purchaseDate" DESC);

-- CreateIndex
CREATE INDEX "CreditCardPurchase_cardId_purchaseDate_idx" ON "CreditCardPurchase"("cardId", "purchaseDate" DESC);

-- CreateIndex
CREATE INDEX "CreditCardInstallment_userId_monthKey_idx" ON "CreditCardInstallment"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "CreditCardInstallment_cardId_monthKey_idx" ON "CreditCardInstallment"("cardId", "monthKey");

-- CreateIndex
CREATE INDEX "CreditCardInstallment_invoiceId_idx" ON "CreditCardInstallment"("invoiceId");

-- CreateIndex
CREATE INDEX "CreditCardInstallment_purchaseId_idx" ON "CreditCardInstallment"("purchaseId");

-- CreateIndex
CREATE INDEX "CreditCardInvoice_userId_monthKey_idx" ON "CreditCardInvoice"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "CreditCardInvoice_transactionId_idx" ON "CreditCardInvoice"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditCardInvoice_cardId_monthKey_key" ON "CreditCardInvoice"("cardId", "monthKey");

-- CreateIndex
CREATE INDEX "FinancialGoal_userId_deadline_idx" ON "FinancialGoal"("userId", "deadline");

-- CreateIndex
CREATE INDEX "FinancialGoal_userId_isSystem_idx" ON "FinancialGoal"("userId", "isSystem");

-- CreateIndex
CREATE INDEX "FinancialGoal_userId_systemKey_idx" ON "FinancialGoal"("userId", "systemKey");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_idx" ON "MonthlyExpense"("userId");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_monthKey_idx" ON "MonthlyExpense"("userId", "monthKey");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_categoryId_idx" ON "MonthlyExpense"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_status_idx" ON "MonthlyExpense"("userId", "status");

-- CreateIndex
CREATE INDEX "MonthlyExpense_userId_createdAt_idx" ON "MonthlyExpense"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "MonthlyExpense_transactionId_idx" ON "MonthlyExpense"("transactionId");

-- CreateIndex
CREATE INDEX "MonthlyExpenseCategory_userId_isSystem_idx" ON "MonthlyExpenseCategory"("userId", "isSystem");

-- CreateIndex
CREATE INDEX "MonthlyExpenseCategory_userId_systemKey_idx" ON "MonthlyExpenseCategory"("userId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyExpenseCategory_userId_name_key" ON "MonthlyExpenseCategory"("userId", "name");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_category_date_idx" ON "Transaction"("userId", "category", "date" DESC);

-- CreateIndex
CREATE INDEX "Transaction_fromWalletId_idx" ON "Transaction"("fromWalletId");

-- CreateIndex
CREATE INDEX "Transaction_toWalletId_idx" ON "Transaction"("toWalletId");

-- CreateIndex
CREATE INDEX "Investment_userId_type_idx" ON "Investment"("userId", "type");

-- CreateIndex
CREATE INDEX "Investment_userId_ticker_idx" ON "Investment"("userId", "ticker");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_userId_date_idx" ON "PortfolioSnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSnapshot_userId_date_kind_key" ON "PortfolioSnapshot"("userId", "date", "kind");

-- CreateIndex
CREATE INDEX "DailyTask_userId_weekday_sortOrder_idx" ON "DailyTask"("userId", "weekday", "sortOrder");

-- CreateIndex
CREATE INDEX "DailyTask_userId_isActive_idx" ON "DailyTask"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTask_userId_weekday_sourceType_sourceId_key" ON "DailyTask"("userId", "weekday", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "TaskCompletion_taskId_logDate_idx" ON "TaskCompletion"("taskId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_taskId_logDate_key" ON "TaskCompletion"("taskId", "logDate");

-- CreateIndex
CREATE INDEX "FinancialGoalActivity_goalId_createdAt_idx" ON "FinancialGoalActivity"("goalId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FinancialGoalActivity_userId_createdAt_idx" ON "FinancialGoalActivity"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FinancialGoalActivity_transactionId_idx" ON "FinancialGoalActivity"("transactionId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_archivedAt_idx" ON "Notification"("userId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

