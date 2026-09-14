/**
 * Copia embebida (como texto) de la migración inicial de Prisma
 * (prisma/migrations/20260913074923_init/migration.sql), statement por
 * statement, para poder crearla desde una ruta de la propia app en runtime.
 *
 * Por qué existe esto: en Vercel, la variable DATABASE_URL que provee la
 * integración de base de datos queda marcada como "Sensitive", y esas
 * variables NO están disponibles durante el paso de build — solo en runtime
 * (funciones). Correr "prisma migrate deploy" en el build falla por eso.
 * Ejecutar estos mismos CREATE TABLE/TYPE acá, desde /api/setup (que corre
 * en runtime), evita ese problema sin depender de la CLI de Prisma dentro
 * de una función serverless.
 *
 * Si en el futuro se agregan campos/tablas nuevas, hay que sumar acá los
 * statements de la migración nueva (además del archivo .sql que genera
 * `prisma migrate dev`).
 */
export const INIT_SCHEMA_STATEMENTS: string[] = [
  `CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE')`,
  `CREATE TYPE "BmrFormula" AS ENUM ('HARRIS_BENEDICT_REVISED', 'MIFFLIN_ST_JEOR')`,
  `CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'INTENSE', 'VERY_INTENSE')`,
  `CREATE TYPE "GoalType" AS ENUM ('LOSS', 'MAINTENANCE', 'GAIN')`,
  `CREATE TYPE "FoodState" AS ENUM ('RAW', 'COOKED', 'NA')`,
  `CREATE TYPE "FoodSource" AS ENUM ('SARA2', 'ANMAT', 'MANUAL')`,
  `CREATE TYPE "FoodStatus" AS ENUM ('ACTIVE', 'NEEDS_REVIEW')`,
  `CREATE TYPE "VersionReason" AS ENUM ('CREATE', 'EDIT', 'MARK_REVIEW', 'RESTORE')`,
  `CREATE TYPE "PreferenceStatus" AS ENUM ('FAVORITE', 'EXCLUDED')`,
  `CREATE TABLE "Profile" (
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
  )`,
  `CREATE TABLE "FoodItem" (
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
  )`,
  `CREATE TABLE "FoodItemVersion" (
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
  )`,
  `CREATE TABLE "ProfileFoodPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "status" "PreferenceStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileFoodPreference_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE "Plan" (
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
  )`,
  `CREATE TABLE "PlanMeal" (
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
  )`,
  `CREATE TABLE "PlanMealItem" (
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
  )`,
  `CREATE INDEX "FoodItem_category_idx" ON "FoodItem"("category")`,
  `CREATE INDEX "FoodItem_status_idx" ON "FoodItem"("status")`,
  `CREATE INDEX "FoodItemVersion_foodItemId_idx" ON "FoodItemVersion"("foodItemId")`,
  `CREATE UNIQUE INDEX "FoodItemVersion_foodItemId_versionNumber_key" ON "FoodItemVersion"("foodItemId", "versionNumber")`,
  `CREATE UNIQUE INDEX "ProfileFoodPreference_profileId_foodItemId_key" ON "ProfileFoodPreference"("profileId", "foodItemId")`,
  `ALTER TABLE "FoodItemVersion" ADD CONSTRAINT "FoodItemVersion_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "ProfileFoodPreference" ADD CONSTRAINT "ProfileFoodPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "ProfileFoodPreference" ADD CONSTRAINT "ProfileFoodPreference_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "Plan" ADD CONSTRAINT "Plan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "PlanMeal" ADD CONSTRAINT "PlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_planMealId_fkey" FOREIGN KEY ("planMealId") REFERENCES "PlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
  `ALTER TABLE "PlanMealItem" ADD CONSTRAINT "PlanMealItem_foodItemVersionId_fkey" FOREIGN KEY ("foodItemVersionId") REFERENCES "FoodItemVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE`,

  // --- Migración 20260914053723_add_meal_suitability ---
  // IF NOT EXISTS + DEFAULT: segura de re-correr y no rompe filas ya
  // existentes en FoodItemVersion (que en el schema.prisma es NOT NULL sin
  // default, porque cada inserción nueva ya manda el valor explícito).
  `ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "suitableBreakfast" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "FoodItem" ADD COLUMN IF NOT EXISTS "suitableMainMeal" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "FoodItemVersion" ADD COLUMN IF NOT EXISTS "suitableBreakfast" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "FoodItemVersion" ADD COLUMN IF NOT EXISTS "suitableMainMeal" BOOLEAN NOT NULL DEFAULT true`,
];
