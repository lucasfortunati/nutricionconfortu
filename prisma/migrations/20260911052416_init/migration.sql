-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "birthDate" DATETIME,
    "ageYears" INTEGER,
    "heightCm" REAL NOT NULL,
    "weightKg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "kcalPer100g" REAL NOT NULL,
    "proteinPer100g" REAL NOT NULL,
    "fatPer100g" REAL NOT NULL,
    "carbPer100g" REAL NOT NULL,
    "sodiumMgPer100g" REAL,
    "householdUnitName" TEXT,
    "householdUnitGrams" REAL,
    "source" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FoodItemVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodItemId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "kcalPer100g" REAL NOT NULL,
    "proteinPer100g" REAL NOT NULL,
    "fatPer100g" REAL NOT NULL,
    "carbPer100g" REAL NOT NULL,
    "sodiumMgPer100g" REAL,
    "householdUnitName" TEXT,
    "householdUnitGrams" REAL,
    "source" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "status" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "changedFields" TEXT,
    "changeNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodItemVersion_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileFoodPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileFoodPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfileFoodPreference_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sexAtCalc" TEXT NOT NULL,
    "ageYearsAtCalc" INTEGER NOT NULL,
    "heightCmAtCalc" REAL NOT NULL,
    "weightKgAtCalc" REAL NOT NULL,
    "formula" TEXT NOT NULL,
    "bmrKcal" REAL NOT NULL,
    "activityLevel" TEXT NOT NULL,
    "activityFactor" REAL NOT NULL,
    "tdeeKcal" REAL NOT NULL,
    "goalType" TEXT NOT NULL,
    "goalAdjustmentPct" REAL NOT NULL,
    "targetKcal" REAL NOT NULL,
    "proteinGPerKg" REAL NOT NULL,
    "fatGPerKg" REAL NOT NULL,
    "targetProteinG" REAL NOT NULL,
    "targetFatG" REAL NOT NULL,
    "targetCarbG" REAL NOT NULL,
    "mealsCount" INTEGER NOT NULL,
    "mealSplit" TEXT NOT NULL,
    CONSTRAINT "Plan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "targetPct" REAL NOT NULL,
    "targetKcal" REAL NOT NULL,
    "targetProteinG" REAL NOT NULL,
    "targetFatG" REAL NOT NULL,
    "targetCarbG" REAL NOT NULL,
    CONSTRAINT "PlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanMealItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planMealId" TEXT NOT NULL,
    "foodItemId" TEXT,
    "foodItemVersionId" TEXT,
    "foodName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceDetail" TEXT,
    "householdUnitName" TEXT,
    "householdUnitGrams" REAL,
    "kcalPer100gSnap" REAL NOT NULL,
    "proteinPer100gSnap" REAL NOT NULL,
    "fatPer100gSnap" REAL NOT NULL,
    "carbPer100gSnap" REAL NOT NULL,
    "grams" REAL NOT NULL,
    "computedKcal" REAL NOT NULL,
    "computedProtein" REAL NOT NULL,
    "computedFat" REAL NOT NULL,
    "computedCarb" REAL NOT NULL,
    CONSTRAINT "PlanMealItem_planMealId_fkey" FOREIGN KEY ("planMealId") REFERENCES "PlanMeal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanMealItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PlanMealItem_foodItemVersionId_fkey" FOREIGN KEY ("foodItemVersionId") REFERENCES "FoodItemVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
