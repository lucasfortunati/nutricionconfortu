-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BmrFormula" AS ENUM ('HARRIS_BENEDICT_REVISED', 'MIFFLIN_ST_JEOR');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'INTENSE', 'VERY_INTENSE');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('LOSS', 'MAINTENANCE', 'GAIN');

-- CreateEnum
CREATE TYPE "FoodState" AS ENUM ('RAW', 'COOKED', 'NA');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('SARA2', 'ANMAT', 'MANUAL');

-- CreateEnum
CREATE TYPE "FoodStatus" AS ENUM ('ACTIVE', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "VersionReason" AS ENUM ('CREATE', 'EDIT', 'MARK_REVIEW', 'RESTORE');

-- CreateEnum
CREATE TYPE "PreferenceStatus" AS ENUM ('FAVORITE', 'EXCLUDED');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "birthDate" TIMESTAMP(3),
    "ageYears" INTEGER,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" "FoodState" NOT NULL,
    "kcalPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "carbPer100g" DOUBLE PRECISION NOT NULL,
    "sodiumMgPer100g" DOUBLE PRECISION,
    "householdUnitName" TEXT,
    "householdUnitGrams" DOUBLE PRECISION,
    "source" "FoodSource" NOT NULL,
    "sourceDetail" TEXT,
    "status" "FoodStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItemVersion" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" "FoodState" NOT NULL,
    "kcalPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "carbPer100g" DOUBLE PRECISION NOT NULL,
    "sodiumMgPer100g" DOUBLE PRECISION,
    "householdUnitName" TEXT,
    "householdUnitGrams" DOUBLE PRECISION,
    "source" "FoodSource" NOT NULL,
    "sourceDetail" TEXT,
    "status" "FoodStatus" NOT NULL,
    "reason" "VersionReason" NOT NULL,
    "changedFields" TEXT,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodItemVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileFoodPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "status" "PreferenceStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileFoodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sexAtCalc" "Sex" NOT NULL,
    "ageYearsAtCalc" INTEGER NOT NULL,
    "heightCmAtCalc" DOUBLE PRECISION NOT NULL,
    "weightKgAtCalc" DOUBLE PRECISION NOT NULL,
    "formula" "BmrFormula" NOT NULL,
    "bmrKcal" DOUBLE PRECISION NOT NULL,
    "activityLevel" "ActivityLevel" NOT NULL,
    "activityFactor" DOUBLE PRECISION NOT NULL,
    "tdeeKcal" DOUBLE PRECISION NOT NULL,
    "goalType" "GoalType" NOT NULL,
    "goalAdjustmentPct" DOUBLE PRECISION NOT NULL,
    "targetKcal" DOUBLE PRECISION NOT NULL,
    "proteinGPerKg" DOUBLE PRECISION NOT NULL,
    "fatGPerKg" DOUBLE PRECISION NOT NULL,
    "targetProteinG" DOUBLE PRECISION NOT NULL,
    "targetFatG" DOUBLE PRECISION NOT NULL,
    "targetCarbG" DOUBLE PRECISION NOT NULL,
    "mealsCount" INTEGER NOT NULL,
    "mealSplit" TEXT NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanMeal" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "targetPct" DOUBLE PRECISION NOT NULL,
    "targetKcal" DOUBLE PRECISION NOT NULL,
    "targetProteinG" DOUBLE PRECISION NOT NULL,
    "targetFatG" DOUBLE PRECISION NOT NULL,
    "targetCarbG" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanMealItem" (
    "id" TEXT NOT NULL,
    "planMealId" TEXT NOT NULL,
    "foodItemId" TEXT,
    "foodItemVersionId" TEXT,
    "foodName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" "FoodState" NOT NULL,
    "source" "FoodSource" NOT NULL,
    "sourceDetail" TEXT,
    "householdUnitName" TEXT,
    "householdUnitGrams" DOUBLE PRECISION,
    "kcalPer100gSnap" DOUBLE PRECISION NOT NULL,
    "proteinPer100gSnap" DOUBLE PRECISION NOT NULL,
    "fatPer100gSnap" DOUBLE PRECISION NOT NULL,
    "carbPer100gSnap" DOUBLE PRECISION NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "computedKcal" DOUBLE PRECISION NOT NULL,
    "computedProtein" DOUBLE PRECISION NOT NULL,
    "computedFat" DOUBLE PRECISION NOT NULL,
    "computedCarb" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PlanMealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodItem_category_idx" ON "FoodItem"("category");

-- CreateIndex
CREATE INDEX "FoodItem_status_idx" ON "FoodItem"("status");

-- CreateIndex
CREATE INDEX "FoodItemVersion_foodItemId_idx" ON "FoodItemVersion"("foodItemId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItemVersion_foodItemId_versionNumber_key" ON "FoodItemVersion"("foodItemId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileFoodPreference_profileId_foodItemId_key" ON "ProfileFoodPreference"("profileId", "foodItemId");

-- AddForeignKey
ALTER TABLE "FoodItemVersion" ADD CONSTRAINT "FoodItemVersion_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileFoodPreference" ADD CONSTRAINT "ProfileFoodPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileFoodPreference" ADD CONSTRAINT "ProfileFoodPreference_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMeal" ADD CONSTRAINT "PlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_planMealId_fkey" FOREIGN KEY ("planMealId") REFERENCES "PlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_foodItemVersionId_fkey" FOREIGN KEY ("foodItemVersionId") REFERENCES "FoodItemVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
