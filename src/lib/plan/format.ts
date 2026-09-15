/**
 * Convierte una cantidad en gramos a su equivalente en medida casera, cuando
 * el alimento tiene una definida. Cuando la cantidad calculada da justo la
 * unidad de referencia (ej. 1 huevo, 1/2 palta), se muestra el nombre solo,
 * sin el "1 ×" redundante.
 */
export function formatHouseholdUnit(
  grams: number,
  unitName: string | null,
  unitGrams: number | null,
): string | null {
  if (!unitName || !unitGrams || unitGrams <= 0) return null;
  const multiple = Math.round((grams / unitGrams) * 10) / 10;
  if (Math.abs(multiple - 1) < 0.05) return unitName;
  return `≈${multiple} × ${unitName}`;
}

/**
 * Cuando el ítem elegido está crudo y tiene un factor de rendimiento cocido
 * cargado (ej. arroz x3, fideos x2.5, papa hervida x1, carnes x0.7), muestra
 * cuánto va a pesar aproximadamente ya cocido — para que la persona no tenga
 * que pesar el alimento crudo si prefiere pesarlo después de cocinarlo.
 */
export function formatCookedYield(
  grams: number,
  state: string,
  cookedYieldFactor: number | null | undefined,
): string | null {
  if (state !== "RAW" || !cookedYieldFactor || cookedYieldFactor <= 0) return null;
  const cookedGrams = Math.round(grams * cookedYieldFactor);
  return `≈${cookedGrams}g cocido`;
}
