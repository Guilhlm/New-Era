-- AlterTable
ALTER TABLE "DietFoodItem" ADD COLUMN "externalSource" TEXT;
ALTER TABLE "DietFoodItem" ADD COLUMN "externalFoodId" TEXT;
ALTER TABLE "DietFoodItem" ADD COLUMN "caloriesPer100g" INTEGER;
ALTER TABLE "DietFoodItem" ADD COLUMN "proteinPer100g" DECIMAL(8,2);
ALTER TABLE "DietFoodItem" ADD COLUMN "carbsPer100g" DECIMAL(8,2);
ALTER TABLE "DietFoodItem" ADD COLUMN "fatsPer100g" DECIMAL(8,2);
