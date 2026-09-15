-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "cookedYieldFactor" DOUBLE PRECISION,
ADD COLUMN     "vegetableGroup" TEXT;

-- AlterTable
ALTER TABLE "FoodItemVersion" ADD COLUMN     "cookedYieldFactor" DOUBLE PRECISION,
ADD COLUMN     "vegetableGroup" TEXT;
