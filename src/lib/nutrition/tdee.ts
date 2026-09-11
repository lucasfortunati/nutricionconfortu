export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "INTENSE" | "VERY_INTENSE";

/** Factor de actividad física aplicado sobre la TMB para obtener el GET. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2, // poco o nulo ejercicio
  LIGHT: 1.375, // ejercicio 1-3 días/semana
  MODERATE: 1.55, // ejercicio 3-5 días/semana
  INTENSE: 1.725, // ejercicio 6-7 días/semana
  VERY_INTENSE: 1.9, // ejercicio diario intenso o trabajo físico
};

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activityLevel];
}
