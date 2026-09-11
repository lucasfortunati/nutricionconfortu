export type GoalType = "LOSS" | "MAINTENANCE" | "GAIN";

/**
 * Valor por defecto de ajuste (%) sugerido por objetivo.
 * LOSS: punto medio del rango sugerido -15% a -20%.
 * GAIN: punto medio del rango sugerido +10% a +15%.
 */
export const GOAL_ADJUSTMENT_DEFAULTS: Record<GoalType, number> = {
  LOSS: -17.5,
  MAINTENANCE: 0,
  GAIN: 12.5,
};

/** Tope máximo de déficit permitido (no se puede superar -25%). */
export const MAX_DEFICIT_PCT = -25;

/**
 * Ajusta el % solicitado a los límites válidos para el objetivo:
 * - LOSS: entre -25% (tope) y 0%.
 * - MAINTENANCE: siempre 0%.
 * - GAIN: no puede ser negativo.
 */
export function clampAdjustmentPct(goalType: GoalType, pct: number): number {
  if (goalType === "MAINTENANCE") return 0;
  if (goalType === "LOSS") return Math.min(0, Math.max(MAX_DEFICIT_PCT, pct));
  return Math.max(0, pct);
}

export function applyGoalAdjustment(tdee: number, goalType: GoalType, adjustmentPct: number): number {
  const clamped = clampAdjustmentPct(goalType, adjustmentPct);
  return tdee * (1 + clamped / 100);
}
