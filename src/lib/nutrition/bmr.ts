export type Sex = "MALE" | "FEMALE";

export interface BmrInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}

export type BmrFormula = "HARRIS_BENEDICT_REVISED" | "MIFFLIN_ST_JEOR";

/**
 * Harris-Benedict revisada (Roza & Shizgal, 1984).
 * No usar la original de 1919: sobreestima el TMB 5-15% en poblaciones actuales.
 */
export function harrisBenedictRevised({ sex, weightKg, heightCm, age }: BmrInput): number {
  if (sex === "MALE") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

/**
 * Mifflin-St Jeor (1990). Estándar de referencia de la American Dietetic
 * Association desde 2005; más precisa que Harris-Benedict.
 */
export function mifflinStJeor({ sex, weightKg, heightCm, age }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "MALE" ? base + 5 : base - 161;
}

export function calculateBmr(formula: BmrFormula, input: BmrInput): number {
  return formula === "HARRIS_BENEDICT_REVISED" ? harrisBenedictRevised(input) : mifflinStJeor(input);
}
