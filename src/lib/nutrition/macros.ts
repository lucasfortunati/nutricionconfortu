import type { GoalType } from "./goal";

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_FAT = 9;
export const KCAL_PER_G_CARB = 4;

/** Piso absoluto de grasas: nunca bajar de 0.5 g/kg. */
export const MIN_FAT_G_PER_KG = 0.5;

export const PROTEIN_G_PER_KG_RANGE: Record<GoalType, [number, number]> = {
  LOSS: [1.8, 2.2],
  MAINTENANCE: [1.6, 2.0],
  GAIN: [1.8, 2.4],
};

/** Rango recomendado de grasas (independiente del objetivo). */
export const FAT_G_PER_KG_RANGE: [number, number] = [0.8, 1.2];

export interface MacroDistributionInput {
  weightKg: number;
  targetKcal: number;
  proteinGPerKg: number;
  fatGPerKg: number;
}

export interface MacroDistributionResult {
  proteinG: number;
  fatG: number;
  carbG: number;
  proteinKcal: number;
  fatKcal: number;
  carbKcal: number;
  proteinPct: number;
  fatPct: number;
  carbPct: number;
  /** Presente cuando proteína + grasa ya superan las calorías objetivo. */
  warning?: string;
}

export function calculateMacroDistribution({
  weightKg,
  targetKcal,
  proteinGPerKg,
  fatGPerKg,
}: MacroDistributionInput): MacroDistributionResult {
  if (fatGPerKg < MIN_FAT_G_PER_KG) {
    throw new Error(`Las grasas no pueden ser menores a ${MIN_FAT_G_PER_KG} g/kg de peso corporal.`);
  }

  const proteinG = proteinGPerKg * weightKg;
  const fatG = fatGPerKg * weightKg;

  const proteinKcal = proteinG * KCAL_PER_G_PROTEIN;
  const fatKcal = fatG * KCAL_PER_G_FAT;
  const remainingKcal = targetKcal - proteinKcal - fatKcal;

  let carbG = remainingKcal / KCAL_PER_G_CARB;
  let warning: string | undefined;

  if (carbG < 0) {
    warning =
      "La proteína y la grasa configuradas ya superan las calorías objetivo: no queda margen para carbohidratos. Reducí los g/kg de proteína o grasa, o subí las calorías objetivo.";
    carbG = 0;
  }

  const carbKcal = carbG * KCAL_PER_G_CARB;
  const totalKcal = proteinKcal + fatKcal + carbKcal;
  const pctBase = totalKcal > 0 ? totalKcal : targetKcal;

  return {
    proteinG,
    fatG,
    carbG,
    proteinKcal,
    fatKcal,
    carbKcal,
    proteinPct: pctBase > 0 ? (proteinKcal / pctBase) * 100 : 0,
    fatPct: pctBase > 0 ? (fatKcal / pctBase) * 100 : 0,
    carbPct: pctBase > 0 ? (carbKcal / pctBase) * 100 : 0,
    warning,
  };
}

export function isProteinGPerKgInRange(goalType: GoalType, value: number): boolean {
  const [min, max] = PROTEIN_G_PER_KG_RANGE[goalType];
  return value >= min && value <= max;
}

export function isFatGPerKgValid(value: number): boolean {
  return value >= MIN_FAT_G_PER_KG;
}
