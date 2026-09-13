/** Convierte una cantidad en gramos a su equivalente en medida casera, cuando el alimento tiene una definida. */
export function formatHouseholdUnit(
  grams: number,
  unitName: string | null,
  unitGrams: number | null,
): string | null {
  if (!unitName || !unitGrams || unitGrams <= 0) return null;
  const multiple = Math.round((grams / unitGrams) * 10) / 10;
  return `≈${multiple} × ${unitName}`;
}
