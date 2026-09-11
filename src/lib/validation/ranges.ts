export const AGE_RANGE = { min: 10, max: 100 } as const;
export const WEIGHT_KG_RANGE = { min: 30, max: 300 } as const;
export const HEIGHT_CM_RANGE = { min: 100, max: 250 } as const;

export function isAgeValid(age: number): boolean {
  return Number.isFinite(age) && age >= AGE_RANGE.min && age <= AGE_RANGE.max;
}

export function isWeightKgValid(weightKg: number): boolean {
  return Number.isFinite(weightKg) && weightKg >= WEIGHT_KG_RANGE.min && weightKg <= WEIGHT_KG_RANGE.max;
}

export function isHeightCmValid(heightCm: number): boolean {
  return Number.isFinite(heightCm) && heightCm >= HEIGHT_CM_RANGE.min && heightCm <= HEIGHT_CM_RANGE.max;
}
