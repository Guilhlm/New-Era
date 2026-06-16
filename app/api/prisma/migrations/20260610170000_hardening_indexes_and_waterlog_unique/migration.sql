-- Deduplicate WaterLog rows that share (userId, logDate), keeping the most
-- recently updated row, before enforcing uniqueness.
DELETE FROM "WaterLog" w
USING "WaterLog" newer
WHERE w."userId" = newer."userId"
  AND w."logDate" = newer."logDate"
  AND (
    w."updatedAt" < newer."updatedAt"
    OR (w."updatedAt" = newer."updatedAt" AND w."id" < newer."id")
  );

-- DropIndex
DROP INDEX "public"."FitnessMacroGoal_userId_idx";

-- DropIndex
DROP INDEX "public"."WorkoutDayPlan_userId_weekday_idx";

-- CreateIndex
CREATE INDEX "DietMeal_userId_weekday_isActive_idx" ON "DietMeal"("userId", "weekday", "isActive");

-- CreateIndex
CREATE INDEX "FitnessMacroGoal_userId_updatedAt_idx" ON "FitnessMacroGoal"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "WaterLog_userId_logDate_key" ON "WaterLog"("userId", "logDate");
