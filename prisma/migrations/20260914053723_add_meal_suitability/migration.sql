/*
  Warnings:

  - Added the required column `suitableBreakfast` to the `FoodItemVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suitableMainMeal` to the `FoodItemVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FoodItem" ADD COLUMN     "suitableBreakfast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suitableMainMeal" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "FoodItemVersion" ADD COLUMN     "suitableBreakfast" BOOLEAN NOT NULL,
ADD COLUMN     "suitableMainMeal" BOOLEAN NOT NULL;
