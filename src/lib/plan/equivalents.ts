import type { FoodItem, PlanMealItem } from "@prisma/client";
import { classifyBreakfastRole, classifyFoodRole } from "./foodRole";
import { isBreakfastStyleMeal } from "./mealSplit";

const BREAKFAST_FILLER_CATEGORY = "Frutas";
const MAIN_FILLER_CATEGORY = "Verduras";

export interface EquivalentOption {
  foodId: string;
  foodName: string;
  grams: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  householdUnitName: string | null;
  householdUnitGrams: number | null;
}

/**
 * Alternativas "equivalentes" a un ítem ya elegido en una comida: otros
 * favoritos del mismo rol (proteína/carbohidrato/grasa) — o, si el ítem es
 * el relleno de fruta/verdura, otros favoritos de esa misma categoría —
 * dimensionadas para aportar aproximadamente las mismas kcal que el ítem
 * actual. Es la idea de "40g de avena o 80g de papa" de un plan armado por
 * intercambios: cualquiera de las opciones cubre lo mismo, se elige la que
 * más guste.
 */
export function computeEquivalentOptions(
  mealName: string,
  currentItem: Pick<
    PlanMealItem,
    "category" | "proteinPer100gSnap" | "fatPer100gSnap" | "carbPer100gSnap" | "foodItemId" | "computedKcal"
  >,
  favoriteFoods: FoodItem[],
): EquivalentOption[] {
  const isBreakfast = isBreakfastStyleMeal(mealName);
  const fillerCategory = isBreakfast ? BREAKFAST_FILLER_CATEGORY : MAIN_FILLER_CATEGORY;
  const classifyRole = isBreakfast ? classifyBreakfastRole : classifyFoodRole;
  const suitableFoods = favoriteFoods.filter((f) => (isBreakfast ? f.suitableBreakfast : f.suitableMainMeal));

  const isFillerItem = currentItem.category === fillerCategory;
  const pool = isFillerItem
    ? suitableFoods.filter((f) => f.category === fillerCategory)
    : suitableFoods.filter((f) => {
        if (f.category === fillerCategory) return false;
        const itemRole = classifyRole({
          category: currentItem.category,
          proteinPer100g: currentItem.proteinPer100gSnap,
          fatPer100g: currentItem.fatPer100gSnap,
          carbPer100g: currentItem.carbPer100gSnap,
        });
        return classifyRole(f) === itemRole;
      });

  return pool
    .filter((f) => f.id !== currentItem.foodItemId)
    .map((f) => {
      const grams = Math.round((currentItem.computedKcal / f.kcalPer100g) * 100);
      const factor = grams / 100;
      return {
        foodId: f.id,
        foodName: f.name,
        grams,
        kcal: f.kcalPer100g * factor,
        proteinG: f.proteinPer100g * factor,
        fatG: f.fatPer100g * factor,
        carbG: f.carbPer100g * factor,
        householdUnitName: f.householdUnitName,
        householdUnitGrams: f.householdUnitGrams,
      };
    })
    .filter((o) => o.grams > 0 && Number.isFinite(o.grams))
    .sort((a, b) => a.foodName.localeCompare(b.foodName));
}
