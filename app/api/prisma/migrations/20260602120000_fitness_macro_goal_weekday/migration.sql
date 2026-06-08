-- AlterTable
ALTER TABLE "FitnessMacroGoal" ADD COLUMN "weekday" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "FitnessMacroGoal_userId_weekday_key" ON "FitnessMacroGoal"("userId", "weekday");
