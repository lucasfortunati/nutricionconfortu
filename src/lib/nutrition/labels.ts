import type { BmrFormula } from "./bmr";
import type { ActivityLevel } from "./tdee";
import type { GoalType } from "./goal";

export const BMR_FORMULA_LABELS: Record<BmrFormula, string> = {
  HARRIS_BENEDICT_REVISED: "Harris-Benedict (revisada, Roza & Shizgal 1984)",
  MIFFLIN_ST_JEOR: "Mifflin-St Jeor (1990)",
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Sedentario (poco o nulo ejercicio)",
  LIGHT: "Ligero (ejercicio 1-3 días/semana)",
  MODERATE: "Moderado (ejercicio 3-5 días/semana)",
  INTENSE: "Intenso (ejercicio 6-7 días/semana)",
  VERY_INTENSE: "Muy intenso (ejercicio diario intenso o trabajo físico)",
};

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  LOSS: "Déficit para pérdida de grasa",
  MAINTENANCE: "Mantenimiento",
  GAIN: "Superávit para ganancia muscular",
};
