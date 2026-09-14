export type FoodRole = "PROTEIN" | "CARB" | "FAT" | "OTHER";

export interface MacroProfile {
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
}

const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_FAT = 9;
const KCAL_PER_G_CARB = 4;

/** Alimentos con muy pocas kcal/100g (ej. lechuga, agua) no se usan como "fuente" de ningún macro. */
const MIN_RELEVANT_KCAL_PER_100G = 10;

/**
 * Clasifica un alimento según qué macro aporta más kcal por 100g.
 * Es una heurística simple (no una tabla nutricional formal): alcanza para elegir
 * qué alimentos probar como fuente de proteína/carbohidrato/grasa en el armado
 * greedy de comidas, no para categorizar alimentos de forma "oficial".
 */
export function classifyFoodRole(food: MacroProfile): FoodRole {
  const proteinKcal = food.proteinPer100g * KCAL_PER_G_PROTEIN;
  const fatKcal = food.fatPer100g * KCAL_PER_G_FAT;
  const carbKcal = food.carbPer100g * KCAL_PER_G_CARB;
  const totalKcal = proteinKcal + fatKcal + carbKcal;

  if (totalKcal < MIN_RELEVANT_KCAL_PER_100G) return "OTHER";
  if (proteinKcal >= fatKcal && proteinKcal >= carbKcal) return "PROTEIN";
  if (fatKcal >= proteinKcal && fatKcal >= carbKcal) return "FAT";
  return "CARB";
}

const BREAKFAST_PROTEIN_CATEGORIES = ["Huevos", "Lácteos"];
const BREAKFAST_CARB_CATEGORIES = ["Cereales y derivados", "Productos envasados"];
const BREAKFAST_FAT_CATEGORIES = ["Frutos secos y semillas", "Grasas y aceites"];

/**
 * Clasificación por categoría (no por kcal) para desayuno/merienda: por
 * densidad calórica el huevo o el queso dan "FAT" con classifyFoodRole (el
 * heurístico de kcal no aplica bien a lácteos/huevo), pero en un desayuno
 * argentino son justamente la fuente de proteína. Se arma por categoría en
 * vez de por macro dominante para reflejar cómo se arma un desayuno real
 * (pan/avena, huevo/queso/yogur, fruta, nueces), no por optimización de macros.
 */
export function classifyBreakfastRole(food: { category: string }): FoodRole {
  if (BREAKFAST_PROTEIN_CATEGORIES.includes(food.category)) return "PROTEIN";
  if (BREAKFAST_CARB_CATEGORIES.includes(food.category)) return "CARB";
  if (BREAKFAST_FAT_CATEGORIES.includes(food.category)) return "FAT";
  return "OTHER";
}
