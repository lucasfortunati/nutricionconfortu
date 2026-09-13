import { prisma } from "@/lib/prisma";
import { calculateBmr } from "@/lib/nutrition/bmr";
import { ACTIVITY_FACTORS, calculateTdee } from "@/lib/nutrition/tdee";
import { applyGoalAdjustment, clampAdjustmentPct } from "@/lib/nutrition/goal";
import { calculateMacroDistribution } from "@/lib/nutrition/macros";
import type { FoodItem, Prisma } from "@prisma/client";
import { distributeMealTargets, type MealTarget } from "./mealSplit";
import { buildMealGreedy, type GreedyMealResult } from "./greedyMeal";
import type { CreatePlanInput } from "./schema";

interface MealGenerationOutcome {
  target: MealTarget;
  result: GreedyMealResult<FoodItem>;
}

async function getFavoriteFoods(profileId: string): Promise<FoodItem[]> {
  const favorites = await prisma.profileFoodPreference.findMany({
    where: { profileId, status: "FAVORITE" },
    include: { foodItem: true },
  });
  // Los alimentos marcados "a revisar" no se usan para generar planes nuevos:
  // su dato está señalado como potencialmente desactualizado.
  return favorites.map((f) => f.foodItem).filter((food) => food.status === "ACTIVE");
}

async function getCurrentVersionIds(foods: FoodItem[]): Promise<Map<string, string>> {
  if (foods.length === 0) return new Map();
  const versions = await prisma.foodItemVersion.findMany({
    where: { OR: foods.map((f) => ({ foodItemId: f.id, versionNumber: f.currentVersion })) },
  });
  return new Map(versions.map((v) => [v.foodItemId, v.id]));
}

async function persistMealItems(
  tx: Prisma.TransactionClient,
  planMealId: string,
  result: GreedyMealResult<FoodItem>,
  versionIdByFoodId: Map<string, string>,
) {
  for (const item of result.items) {
    await tx.planMealItem.create({
      data: {
        planMealId,
        foodItemId: item.food.id,
        foodItemVersionId: versionIdByFoodId.get(item.food.id) ?? null,
        foodName: item.food.name,
        category: item.food.category,
        state: item.food.state,
        source: item.food.source,
        sourceDetail: item.food.sourceDetail,
        householdUnitName: item.food.householdUnitName,
        householdUnitGrams: item.food.householdUnitGrams,
        kcalPer100gSnap: item.food.kcalPer100g,
        proteinPer100gSnap: item.food.proteinPer100g,
        fatPer100gSnap: item.food.fatPer100g,
        carbPer100gSnap: item.food.carbPer100g,
        grams: item.grams,
        computedKcal: item.kcal,
        computedProtein: item.proteinG,
        computedFat: item.fatG,
        computedCarb: item.carbG,
      },
    });
  }
}

export async function createPlan(profileId: string, input: CreatePlanInput) {
  const bmr = calculateBmr(input.formula, {
    sex: input.sex,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    age: input.ageYears,
  });
  const activityFactor = ACTIVITY_FACTORS[input.activityLevel];
  const tdee = calculateTdee(bmr, input.activityLevel);
  const clampedAdjustmentPct = clampAdjustmentPct(input.goalType, input.goalAdjustmentPct);
  const targetKcal = applyGoalAdjustment(tdee, input.goalType, input.goalAdjustmentPct);
  const macros = calculateMacroDistribution({
    weightKg: input.weightKg,
    targetKcal,
    proteinGPerKg: input.proteinGPerKg,
    fatGPerKg: input.fatGPerKg,
  });

  const dailyTargets = { kcal: targetKcal, proteinG: macros.proteinG, fatG: macros.fatG, carbG: macros.carbG };
  const mealTargets = distributeMealTargets(dailyTargets, input.mealSplit);

  const favoriteFoods = await getFavoriteFoods(profileId);
  const versionIdByFoodId = await getCurrentVersionIds(favoriteFoods);

  const outcomes: MealGenerationOutcome[] = mealTargets.map((target) => ({
    target,
    result: buildMealGreedy(target, favoriteFoods),
  }));

  const planId = await prisma.$transaction(async (tx) => {
    const plan = await tx.plan.create({
      data: {
        profileId,
        label: input.label ?? null,
        sexAtCalc: input.sex,
        ageYearsAtCalc: input.ageYears,
        heightCmAtCalc: input.heightCm,
        weightKgAtCalc: input.weightKg,
        formula: input.formula,
        bmrKcal: bmr,
        activityLevel: input.activityLevel,
        activityFactor,
        tdeeKcal: tdee,
        goalType: input.goalType,
        goalAdjustmentPct: clampedAdjustmentPct,
        targetKcal,
        proteinGPerKg: input.proteinGPerKg,
        fatGPerKg: input.fatGPerKg,
        targetProteinG: macros.proteinG,
        targetFatG: macros.fatG,
        targetCarbG: macros.carbG,
        mealsCount: input.mealSplit.length,
        mealSplit: JSON.stringify(input.mealSplit),
      },
    });

    for (const [index, outcome] of outcomes.entries()) {
      const meal = await tx.planMeal.create({
        data: {
          planId: plan.id,
          order: index,
          name: outcome.target.name,
          targetPct: outcome.target.pct,
          targetKcal: outcome.target.kcal,
          targetProteinG: outcome.target.proteinG,
          targetFatG: outcome.target.fatG,
          targetCarbG: outcome.target.carbG,
        },
      });

      await persistMealItems(tx, meal.id, outcome.result, versionIdByFoodId);
    }

    return plan.id;
  });

  return {
    plan: await getPlan(planId),
    macroWarning: macros.warning ?? null,
    mealWarnings: outcomes
      .filter((o) => o.result.warnings.length > 0)
      .map((o) => ({ mealName: o.target.name, warnings: o.result.warnings })),
  };
}

export async function listPlans(profileId: string) {
  return prisma.plan.findMany({ where: { profileId }, orderBy: { createdAt: "desc" } });
}

export async function getPlan(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      meals: {
        orderBy: { order: "asc" },
        include: { items: { orderBy: { id: "asc" } } },
      },
    },
  });
}

export async function regenerateMeal(planMealId: string) {
  const meal = await prisma.planMeal.findUniqueOrThrow({
    where: { id: planMealId },
    include: { plan: true },
  });

  const favoriteFoods = await getFavoriteFoods(meal.plan.profileId);
  const versionIdByFoodId = await getCurrentVersionIds(favoriteFoods);

  const target = {
    kcal: meal.targetKcal,
    proteinG: meal.targetProteinG,
    fatG: meal.targetFatG,
    carbG: meal.targetCarbG,
  };
  const result = buildMealGreedy(target, favoriteFoods);

  await prisma.$transaction(async (tx) => {
    await tx.planMealItem.deleteMany({ where: { planMealId } });
    await persistMealItems(tx, planMealId, result, versionIdByFoodId);
  });

  const updatedMeal = await prisma.planMeal.findUniqueOrThrow({
    where: { id: planMealId },
    include: { items: { orderBy: { id: "asc" } } },
  });

  return { meal: updatedMeal, warnings: result.warnings };
}
