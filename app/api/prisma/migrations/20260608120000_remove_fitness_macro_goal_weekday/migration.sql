-- DropIndex
DROP INDEX IF EXISTS "FitnessMacroGoal_userId_weekday_key";

-- AlterTable
ALTER TABLE "FitnessMacroGoal" DROP COLUMN IF EXISTS "weekday";
