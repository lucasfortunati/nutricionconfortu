import { prisma } from "@/lib/prisma";
import { calculateBmr } from "@/lib/nutrition/bmr";
import { ACTIVITY_FACTORS, calculateTdee } from "@/lib/nutrition/tdee";
import { applyGoalAdjustment, clampAdjustmentPct } from "@/lib/nutrition/goal";
import { calculateMacroDistribution } from "@/lib/nutrition/macros";
import type { FoodItem, Prisma } from "@prisma/client";
import { classifyBreakfastRole } from "./foodRole";
import { distributeMealTargets, isBreakfastStyleMeal, type MealTarget } from "./mealSplit";
import { buildMealGreedy, type GreedyMealResult, type MealMacroTarget } from "./greedyMeal";
import { computeEquivalentOptions, type EquivalentOption } from "./equivalents";
import type { CreatePlanInput } from "./schema";

const BREAKFAST_FILLER_CATEGORY = "Frutas";

/**
 * Arma una comida respetando qué alimentos tienen sentido según el tipo:
 * desayuno/merienda/colación usa solo favoritos marcados suitableBreakfast
 * (pan, huevo, yogur, fruta, nueces) y clasifica roles por categoría;
 * almuerzo/cena usa solo suitableMainMeal (carnes, arroz, legumbres,
 * verduras) con la heurística de macros por kcal.
 */
function buildMealFor(
  mealName: string,
  target: MealMacroTarget,
  favoriteFoods: FoodItem[],
): GreedyMealResult<FoodItem> {
  if (isBreakfastStyleMeal(mealName)) {
    const candidates = favoriteFoods.filter((f) => f.suitableBreakfast);
    return buildMealGreedy(target, candidates, {
      roleClassifier: classifyBreakfastRole,
      fillerCategory: BREAKFAST_FILLER_CATEGORY,
    });
  }

  const candidates = favoriteFoods.filter((f) => f.suitableMainMeal);
  return buildMealGreedy(target, candidates);
}

interface MealGenerationOutcome {
  target: MealTarget;
  result: GreedyMealResult<FoodItem>;
}

export async function getFavoriteFoods(profileId: string): Promise<FoodItem[]> {
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
    result: buildMealFor(target.name, target, favoriteFoods),
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
        include: {
          items: {
            orderBy: { id: "asc" },
            // cookedYieldFactor es solo una ayuda de visualización (cuánto pesa
            // cocido el ítem crudo elegido); se lee en vivo del FoodItem en vez
            // de sacar una snapshot porque no afecta los macros ya calculados.
            include: { foodItem: { select: { cookedYieldFactor: true } } },
          },
        },
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
  const result = buildMealFor(meal.name, target, favoriteFoods);

  await prisma.$transaction(async (tx) => {
    await tx.planMealItem.deleteMany({ where: { planMealId } });
    await persistMealItems(tx, planMealId, result, versionIdByFoodId);
  });

  const updatedMeal = await prisma.planMeal.findUniqueOrThrow({
    where: { id: planMealId },
    include: {
      items: { orderBy: { id: "asc" }, include: { foodItem: { select: { cookedYieldFactor: true } } } },
    },
  });

  return { meal: updatedMeal, warnings: result.warnings };
}

async function loadItemWithMealName(itemId: string) {
  const item = await prisma.planMealItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { planMeal: { include: { plan: true } } },
  });
  return { item, mealName: item.planMeal.name, profileId: item.planMeal.plan.profileId };
}

/**
 * Alternativas "equivalentes" a un ítem ya elegido en una comida (ver
 * computeEquivalentOptions): mismas kcal aproximadas, mismo rol o misma
 * categoría de relleno, solo entre los favoritos del perfil.
 */
export async function getEquivalentOptionsForItem(itemId: string): Promise<EquivalentOption[]> {
  const { item, mealName, profileId } = await loadItemWithMealName(itemId);
  const favoriteFoods = await getFavoriteFoods(profileId);
  return computeEquivalentOptions(mealName, item, favoriteFoods);
}

/**
 * Reemplaza el alimento de un ítem ya generado por otro favorito, ajustando
 * los gramos para mantener aproximadamente las mismas kcal que tenía el
 * ítem original (el mismo cálculo que se le mostró al usuario como opción).
 */
export async function swapMealItem(itemId: string, foodItemId: string) {
  const { item } = await loadItemWithMealName(itemId);

  const targetFood = await prisma.foodItem.findUniqueOrThrow({ where: { id: foodItemId } });
  const targetVersion = await prisma.foodItemVersion.findFirst({
    where: { foodItemId: targetFood.id, versionNumber: targetFood.currentVersion },
  });

  const grams = Math.round((item.computedKcal / targetFood.kcalPer100g) * 100);
  const factor = grams / 100;

  return prisma.planMealItem.update({
    where: { id: itemId },
    data: {
      foodItemId: targetFood.id,
      foodItemVersionId: targetVersion?.id ?? null,
      foodName: targetFood.name,
      category: targetFood.category,
      state: targetFood.state,
      source: targetFood.source,
      sourceDetail: targetFood.sourceDetail,
      householdUnitName: targetFood.householdUnitName,
      householdUnitGrams: targetFood.householdUnitGrams,
      kcalPer100gSnap: targetFood.kcalPer100g,
      proteinPer100gSnap: targetFood.proteinPer100g,
      fatPer100gSnap: targetFood.fatPer100g,
      carbPer100gSnap: targetFood.carbPer100g,
      grams,
      computedKcal: targetFood.kcalPer100g * factor,
      computedProtein: targetFood.proteinPer100g * factor,
      computedFat: targetFood.fatPer100g * factor,
      computedCarb: targetFood.carbPer100g * factor,
    },
    include: { foodItem: { select: { cookedYieldFactor: true } } },
  });
}
