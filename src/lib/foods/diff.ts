/** Campos que se versionan: cualquier cambio en alguno de estos genera una nueva FoodItemVersion. */
export const FOOD_VERSIONED_FIELDS = [
  "name",
  "category",
  "state",
  "kcalPer100g",
  "proteinPer100g",
  "fatPer100g",
  "carbPer100g",
  "sodiumMgPer100g",
  "householdUnitName",
  "householdUnitGrams",
  "source",
  "sourceDetail",
  "status",
] as const;

export type VersionedField = (typeof FOOD_VERSIONED_FIELDS)[number];

export function computeChangedFields(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): VersionedField[] {
  return FOOD_VERSIONED_FIELDS.filter((field) => (prev[field] ?? null) !== (next[field] ?? null));
}
