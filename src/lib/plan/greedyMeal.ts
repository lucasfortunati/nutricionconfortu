import { classifyFoodRole, type FoodRole, type MacroProfile } from "./foodRole";

export interface CandidateFood extends MacroProfile {
  id: string;
  name: string;
  category: string;
  kcalPer100g: number;
}

export interface MealMacroTarget {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

export interface MealItemResult<T extends CandidateFood = CandidateFood> {
  food: T;
  grams: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
}

export interface ToleranceFlags {
  kcal: boolean;
  proteinG: boolean;
  fatG: boolean;
  carbG: boolean;
}

export interface GreedyMealResult<T extends CandidateFood = CandidateFood> {
  items: MealItemResult<T>[];
  totals: MealMacroTarget;
  withinTolerance: ToleranceFlags;
  warnings: string[];
}

export interface GreedyMealOptions {
  /** Margen de error aceptado por macro, en %. Default 10 (según especificación: ±5-10%). */
  tolerancePct?: number;
  /** Generador de números aleatorios, inyectable para tests determinísticos. */
  random?: () => number;
  /** Tope de gramos por ítem para evitar resultados absurdos (ej. 3kg de un alimento). */
  maxGramsPerItem?: number;
  /** Porción fija del alimento de relleno, cuando hay una candidata disponible. */
  fillerGrams?: number;
  /** Categoría usada como relleno de porción fija: verdura en almuerzo/cena, fruta en desayuno/merienda. */
  fillerCategory?: string;
  /** Cómo clasificar el rol de cada alimento; por defecto la heurística por kcal (pensada para almuerzo/cena). */
  roleClassifier?: (food: CandidateFood) => FoodRole;
}

const DEFAULT_TOLERANCE_PCT = 10;
const DEFAULT_MAX_GRAMS_PER_ITEM = 500;
const DEFAULT_FILLER_GRAMS = 100;
const DEFAULT_FILLER_CATEGORY = "Verduras";

function pickRandom<T>(list: T[], random: () => number): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(random() * list.length)];
}

function macrosFor<T extends CandidateFood>(food: T, grams: number) {
  const factor = grams / 100;
  return {
    kcal: food.kcalPer100g * factor,
    proteinG: food.proteinPer100g * factor,
    fatG: food.fatPer100g * factor,
    carbG: food.carbPer100g * factor,
  };
}

function withinPct(actual: number, target: number, tolerancePct: number): boolean {
  if (target <= 0) return actual <= 0.0001;
  return Math.abs(actual - target) / target <= tolerancePct / 100;
}

/**
 * Arma una comida de forma greedy: elige un alimento favorito por rol
 * (proteína / carbohidrato / grasa) y resuelve las cantidades para acercarse
 * a los macros objetivo, con margen de error ±5-10% (no busca el óptimo
 * matemático, solo una combinación razonable).
 */
export function buildMealGreedy<T extends CandidateFood>(
  target: MealMacroTarget,
  candidates: T[],
  options: GreedyMealOptions = {},
): GreedyMealResult<T> {
  const tolerancePct = options.tolerancePct ?? DEFAULT_TOLERANCE_PCT;
  const random = options.random ?? Math.random;
  const maxGrams = options.maxGramsPerItem ?? DEFAULT_MAX_GRAMS_PER_ITEM;
  const fillerGrams = options.fillerGrams ?? DEFAULT_FILLER_GRAMS;
  const fillerCategory = options.fillerCategory ?? DEFAULT_FILLER_CATEGORY;
  const classifyRole = options.roleClassifier ?? classifyFoodRole;

  const warnings: string[] = [];

  // El alimento de relleno (verdura en almuerzo/cena, fruta en desayuno/
  // merienda) nunca se elige como fuente principal de un macro: su densidad
  // calórica suele ser tan baja que terminaría pidiendo porciones irreales
  // (ej. >1kg de brócoli para llegar a 100g de carbohidratos). Solo entra
  // como porción fija aparte.
  const nonFillerCandidates = candidates.filter((f) => f.category !== fillerCategory);
  const proteinCandidates = nonFillerCandidates.filter((f) => classifyRole(f) === "PROTEIN");
  const carbCandidates = nonFillerCandidates.filter((f) => classifyRole(f) === "CARB");
  const fatCandidates = nonFillerCandidates.filter((f) => classifyRole(f) === "FAT");
  const fillerCandidates = candidates.filter((f) => f.category === fillerCategory);

  const proteinFood = pickRandom(proteinCandidates, random);
  const carbFood = pickRandom(carbCandidates, random);
  const fatFood = pickRandom(fatCandidates, random);
  const fillerFood = pickRandom(fillerCandidates, random);

  const items: MealItemResult<T>[] = [];

  function addItem(food: T, grams: number) {
    let clampedGrams = grams;
    if (clampedGrams > maxGrams) {
      warnings.push(
        `${food.name}: la cantidad calculada (${Math.round(grams)}g) se limitó a ${maxGrams}g para evitar una porción irreal.`,
      );
      clampedGrams = maxGrams;
    }
    clampedGrams = Math.round(clampedGrams);
    if (clampedGrams <= 0) return;
    items.push({ food, grams: clampedGrams, ...macrosFor(food, clampedGrams) });
  }

  // 1) Proteína: cubre directamente el objetivo de proteína.
  if (proteinFood && proteinFood.proteinPer100g > 0) {
    const grams = (target.proteinG / proteinFood.proteinPer100g) * 100;
    addItem(proteinFood, grams);
  } else {
    warnings.push("No hay favoritos clasificados como fuente de proteína: el objetivo de proteína no se cubrió.");
  }

  const proteinContribution = items[0] ? macrosFor(items[0].food, items[0].grams) : { fatG: 0, carbG: 0 };

  // 2) Carbohidrato: cubre lo que falta después de descontar el aporte de la proteína elegida.
  if (carbFood && carbFood.carbPer100g > 0) {
    const remainingCarbG = Math.max(0, target.carbG - proteinContribution.carbG);
    const grams = (remainingCarbG / carbFood.carbPer100g) * 100;
    addItem(carbFood, grams);
  } else {
    warnings.push("No hay favoritos clasificados como fuente de carbohidrato: el objetivo de carbohidrato no se cubrió.");
  }

  const carbItem = items[items.length - 1]?.food === carbFood ? items[items.length - 1] : null;
  const carbContributionFat = carbItem ? macrosFor(carbItem.food, carbItem.grams).fatG : 0;

  // 3) Grasa: cubre lo que quede pendiente después de proteína y carbohidrato.
  const remainingFatG = target.fatG - proteinContribution.fatG - carbContributionFat;
  if (remainingFatG > 0) {
    if (fatFood && fatFood.fatPer100g > 0) {
      const grams = (remainingFatG / fatFood.fatPer100g) * 100;
      addItem(fatFood, grams);
    } else {
      warnings.push("No hay favoritos clasificados como fuente de grasa: el objetivo de grasa no se cubrió del todo.");
    }
  }

  // 3.5) Ajuste de proteína: al ir primero, no descontaba lo que ya aportan el
  // carbohidrato y la grasa elegidos (ej. arroz o legumbres tienen proteína
  // real). Carbohidrato y grasa sí se resuelven descontando lo anterior; acá
  // se le da a la proteína el mismo tratamiento en una segunda pasada.
  if (proteinFood && items[0]?.food === proteinFood) {
    const otherProteinG = items.slice(1).reduce((sum, item) => sum + item.proteinG, 0);
    const adjustedTargetG = Math.max(0, target.proteinG - otherProteinG);
    const grams = Math.round(Math.min((adjustedTargetG / proteinFood.proteinPer100g) * 100, maxGrams));
    if (grams <= 0) {
      items.shift();
    } else {
      items[0] = { food: proteinFood, grams, ...macrosFor(proteinFood, grams) };
    }
  }

  // 4) Relleno de porción fija (verdura o fruta según la comida): aporte menor, mejora lo realista del plato.
  if (fillerFood && !items.some((i) => i.food.id === fillerFood.id)) {
    addItem(fillerFood, fillerGrams);
  }

  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      proteinG: acc.proteinG + item.proteinG,
      fatG: acc.fatG + item.fatG,
      carbG: acc.carbG + item.carbG,
    }),
    { kcal: 0, proteinG: 0, fatG: 0, carbG: 0 },
  );

  const withinTolerance: ToleranceFlags = {
    kcal: withinPct(totals.kcal, target.kcal, tolerancePct),
    proteinG: withinPct(totals.proteinG, target.proteinG, tolerancePct),
    fatG: withinPct(totals.fatG, target.fatG, tolerancePct),
    carbG: withinPct(totals.carbG, target.carbG, tolerancePct),
  };

  if (!withinTolerance.kcal || !withinTolerance.proteinG || !withinTolerance.fatG || !withinTolerance.carbG) {
    warnings.push(
      "Esta combinación quedó fuera del margen de ±10% en alguno de los macros. Podés regenerar la comida o sumar más favoritos variados.",
    );
  }

  return { items, totals, withinTolerance, warnings };
}
