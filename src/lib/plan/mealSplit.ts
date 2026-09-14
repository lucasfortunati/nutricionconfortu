export interface MealSplitEntry {
  name: string;
  pct: number;
}

export interface DailyTargets {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

export interface MealTarget extends DailyTargets {
  name: string;
  pct: number;
}

/** Presets razonables de reparto de calorías por comida, editables por el usuario. */
export const DEFAULT_MEAL_SPLITS: Record<number, MealSplitEntry[]> = {
  3: [
    { name: "Desayuno", pct: 25 },
    { name: "Almuerzo", pct: 40 },
    { name: "Cena", pct: 35 },
  ],
  4: [
    { name: "Desayuno", pct: 20 },
    { name: "Almuerzo", pct: 35 },
    { name: "Merienda", pct: 15 },
    { name: "Cena", pct: 30 },
  ],
  5: [
    { name: "Desayuno", pct: 20 },
    { name: "Colación", pct: 10 },
    { name: "Almuerzo", pct: 30 },
    { name: "Merienda", pct: 15 },
    { name: "Cena", pct: 25 },
  ],
  6: [
    { name: "Desayuno", pct: 15 },
    { name: "Colación", pct: 10 },
    { name: "Almuerzo", pct: 25 },
    { name: "Merienda", pct: 15 },
    { name: "Colación", pct: 10 },
    { name: "Cena", pct: 25 },
  ],
};

/** Para cantidades de comidas sin preset, reparte en partes iguales. */
export function getDefaultMealSplit(mealsCount: number): MealSplitEntry[] {
  const preset = DEFAULT_MEAL_SPLITS[mealsCount];
  if (preset) return preset;

  const basePct = Math.floor((100 / mealsCount) * 100) / 100;
  return Array.from({ length: mealsCount }, (_, i) => ({
    name: `Comida ${i + 1}`,
    pct: i === mealsCount - 1 ? Math.round((100 - basePct * (mealsCount - 1)) * 100) / 100 : basePct,
  }));
}

export function isValidMealSplit(splits: MealSplitEntry[]): boolean {
  const total = splits.reduce((sum, s) => sum + s.pct, 0);
  return Math.abs(total - 100) < 0.01;
}

const BREAKFAST_STYLE_MEAL_NAMES = ["desayuno", "merienda", "colación"];

/**
 * Desayuno/merienda/colación se arman con otro tipo de alimentos que
 * almuerzo/cena (pan/huevo/yogur/fruta, no carne/arroz/legumbres). Se
 * detecta por el nombre de la comida, no hay otro campo que lo distinga.
 */
export function isBreakfastStyleMeal(mealName: string): boolean {
  return BREAKFAST_STYLE_MEAL_NAMES.includes(mealName.trim().toLowerCase());
}

export function distributeMealTargets(daily: DailyTargets, splits: MealSplitEntry[]): MealTarget[] {
  return splits.map((s) => ({
    name: s.name,
    pct: s.pct,
    kcal: (daily.kcal * s.pct) / 100,
    proteinG: (daily.proteinG * s.pct) / 100,
    fatG: (daily.fatG * s.pct) / 100,
    carbG: (daily.carbG * s.pct) / 100,
  }));
}
