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
/**
 * Tope de densidad calórica para calificar como relleno de porción fija. La
 * mayoría de las verduras y frutas están muy por debajo de esto, pero un caso
 * como la palta (~160 kcal/100g, categorizada como "Frutas" pero pensada como
 * fuente de grasa, no como fruta de postre) no debe usarse como relleno de
 * 100g fijos: rompería el objetivo de grasa de un desayuno o merienda chico.
 */
const MAX_FILLER_KCAL_PER_100G = 100;

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

const MIN_DETERMINANT = 1e-9;
const MIN_FEASIBLE_GRAMS = -1e-6;

/**
 * Resuelve el sistema de 3 ecuaciones (proteína/grasa/carbohidrato objetivo)
 * y 3 incógnitas (gramos de cada alimento) por regla de Cramer. A diferencia
 * de resolver un macro por vez, esto tiene en cuenta que un mismo alimento
 * aporta de los tres macros a la vez (ej. avena aporta proteína real, nuez
 * aporta carbohidrato real): con targets alcanzables da el calce exacto en
 * vez de una aproximación que se va lejos del objetivo cuando hay varios
 * alimentos con cross-contaminación de macros. Devuelve null si el sistema
 * no tiene solución (alimentos con perfiles de macro colineales) o si la
 * solución pide gramos negativos de algún alimento (target fuera del rango
 * que esos tres alimentos pueden cubrir juntos): en esos casos se recurre al
 * armado secuencial de respaldo.
 */
function solveExactGrams(
  target: MealMacroTarget,
  proteinFood: CandidateFood,
  carbFood: CandidateFood,
  fatFood: CandidateFood,
): { proteinGrams: number; carbGrams: number; fatGrams: number } | null {
  // Columnas: gramos de [proteinFood, carbFood, fatFood]. Filas: ecuación de proteína/grasa/carbohidrato.
  const a = [
    [proteinFood.proteinPer100g / 100, carbFood.proteinPer100g / 100, fatFood.proteinPer100g / 100],
    [proteinFood.fatPer100g / 100, carbFood.fatPer100g / 100, fatFood.fatPer100g / 100],
    [proteinFood.carbPer100g / 100, carbFood.carbPer100g / 100, fatFood.carbPer100g / 100],
  ];
  const b = [target.proteinG, target.fatG, target.carbG];

  function det3([[a11, a12, a13], [a21, a22, a23], [a31, a32, a33]]: number[][]): number {
    return (
      a11 * (a22 * a33 - a23 * a32) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31)
    );
  }

  const d = det3(a);
  if (!Number.isFinite(d) || Math.abs(d) < MIN_DETERMINANT) return null;

  const withColumn = (col: 0 | 1 | 2) => a.map((row, i) => row.map((v, j) => (j === col ? b[i] : v)));

  const proteinGrams = det3(withColumn(0)) / d;
  const carbGrams = det3(withColumn(1)) / d;
  const fatGrams = det3(withColumn(2)) / d;

  if (
    [proteinGrams, carbGrams, fatGrams].some((g) => !Number.isFinite(g) || g < MIN_FEASIBLE_GRAMS)
  ) {
    return null;
  }

  return {
    proteinGrams: Math.max(0, proteinGrams),
    carbGrams: Math.max(0, carbGrams),
    fatGrams: Math.max(0, fatGrams),
  };
}

function relativeError(actual: number, target: number): number {
  if (target <= 0) return actual <= 0.0001 ? 0 : 1;
  return Math.abs(actual - target) / target;
}

function sumTotals<T extends CandidateFood>(items: MealItemResult<T>[]): MealMacroTarget {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      proteinG: acc.proteinG + item.proteinG,
      fatG: acc.fatG + item.fatG,
      carbG: acc.carbG + item.carbG,
    }),
    { kcal: 0, proteinG: 0, fatG: 0, carbG: 0 },
  );
}

function addClampedItem<T extends CandidateFood>(
  items: MealItemResult<T>[],
  warnings: string[],
  food: T,
  grams: number,
  maxGrams: number,
) {
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

/**
 * Arma los ítems de proteína/carbohidrato/grasa para una terna puntual de
 * alimentos (alguno puede ser null si ese rol no tiene candidatos). Cuando
 * están los tres, resuelve el sistema exacto (ver solveExactGrams); si no,
 * cae a un armado secuencial más simple que cubre lo que puede con los
 * roles disponibles. No agrega el relleno (verdura/fruta): eso lo maneja
 * buildMealGreedy una sola vez, después de elegir la mejor terna.
 */
function buildRoleItems<T extends CandidateFood>(
  target: MealMacroTarget,
  proteinFood: T | null,
  carbFood: T | null,
  fatFood: T | null,
  maxGrams: number,
  warnings: string[],
): MealItemResult<T>[] {
  const items: MealItemResult<T>[] = [];
  const exact =
    proteinFood && carbFood && fatFood ? solveExactGrams(target, proteinFood, carbFood, fatFood) : null;

  if (exact && proteinFood && carbFood && fatFood) {
    addClampedItem(items, warnings, proteinFood, exact.proteinGrams, maxGrams);
    addClampedItem(items, warnings, carbFood, exact.carbGrams, maxGrams);
    addClampedItem(items, warnings, fatFood, exact.fatGrams, maxGrams);
    return items;
  }

  // 1) Proteína: cubre directamente el objetivo de proteína.
  if (proteinFood && proteinFood.proteinPer100g > 0) {
    const grams = (target.proteinG / proteinFood.proteinPer100g) * 100;
    addClampedItem(items, warnings, proteinFood, grams, maxGrams);
  }

  const proteinContribution = items[0] ? macrosFor(items[0].food, items[0].grams) : { fatG: 0, carbG: 0 };

  // 2) Carbohidrato: cubre lo que falta después de descontar el aporte de la proteína elegida.
  if (carbFood && carbFood.carbPer100g > 0) {
    const remainingCarbG = Math.max(0, target.carbG - proteinContribution.carbG);
    const grams = (remainingCarbG / carbFood.carbPer100g) * 100;
    addClampedItem(items, warnings, carbFood, grams, maxGrams);
  }

  const carbItem = items[items.length - 1]?.food === carbFood ? items[items.length - 1] : null;
  const carbContributionFat = carbItem ? macrosFor(carbItem.food, carbItem.grams).fatG : 0;

  // 3) Grasa: cubre lo que quede pendiente después de proteína y carbohidrato.
  const remainingFatG = target.fatG - proteinContribution.fatG - carbContributionFat;
  if (remainingFatG > 0 && fatFood && fatFood.fatPer100g > 0) {
    const grams = (remainingFatG / fatFood.fatPer100g) * 100;
    addClampedItem(items, warnings, fatFood, grams, maxGrams);
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

  return items;
}

/**
 * Arma una comida buscando, entre todas las combinaciones de favoritos
 * disponibles por rol (proteína / carbohidrato / grasa), la que mejor
 * calza con los macros objetivo (en vez de un pick al azar, que con
 * alimentos reales de cross-contaminación real de macros a veces quedaba
 * lejos del objetivo aunque hubiera una combinación mejor entre los
 * mismos favoritos). La cantidad de combinaciones es chica (un puñado de
 * favoritos por rol), así que probarlas todas es barato.
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
  const fillerCandidates = candidates.filter(
    (f) => f.category === fillerCategory && f.kcalPer100g <= MAX_FILLER_KCAL_PER_100G,
  );

  const proteinOptions: (T | null)[] = proteinCandidates.length > 0 ? proteinCandidates : [null];
  const carbOptions: (T | null)[] = carbCandidates.length > 0 ? carbCandidates : [null];
  const fatOptions: (T | null)[] = fatCandidates.length > 0 ? fatCandidates : [null];

  // El relleno se elige y se descuenta del objetivo ANTES de resolver
  // proteína/carbohidrato/grasa: es una porción fija que también aporta
  // macros (ej. 100g de fruta tienen carbohidrato real), y si no se
  // descuenta el resto de la comida termina sistemáticamente por encima
  // del objetivo en vez de calzar.
  const fillerFood = pickRandom(fillerCandidates, random);
  const fillerContribution = fillerFood ? macrosFor(fillerFood, Math.min(fillerGrams, maxGrams)) : null;
  const solveTarget: MealMacroTarget = fillerContribution
    ? {
        kcal: Math.max(0, target.kcal - fillerContribution.kcal),
        proteinG: Math.max(0, target.proteinG - fillerContribution.proteinG),
        fatG: Math.max(0, target.fatG - fillerContribution.fatG),
        carbG: Math.max(0, target.carbG - fillerContribution.carbG),
      }
    : target;

  let bestScore = Infinity;
  let bestChoice: { p: T | null; c: T | null; f: T | null } = { p: null, c: null, f: null };
  for (const p of proteinOptions) {
    for (const c of carbOptions) {
      for (const f of fatOptions) {
        const scratchWarnings: string[] = [];
        const roleItems = buildRoleItems(solveTarget, p, c, f, maxGrams, scratchWarnings);
        const totals = sumTotals(roleItems);
        const score =
          relativeError(totals.proteinG, solveTarget.proteinG) +
          relativeError(totals.fatG, solveTarget.fatG) +
          relativeError(totals.carbG, solveTarget.carbG);
        if (score < bestScore) {
          bestScore = score;
          bestChoice = { p, c, f };
        }
      }
    }
  }

  const items: MealItemResult<T>[] = buildRoleItems(
    solveTarget,
    bestChoice.p,
    bestChoice.c,
    bestChoice.f,
    maxGrams,
    warnings,
  );

  if (proteinCandidates.length === 0) {
    warnings.push("No hay favoritos clasificados como fuente de proteína: el objetivo de proteína no se cubrió.");
  }
  if (carbCandidates.length === 0) {
    warnings.push("No hay favoritos clasificados como fuente de carbohidrato: el objetivo de carbohidrato no se cubrió.");
  }
  if (fatCandidates.length === 0) {
    const coveredFatG = items.reduce((sum, item) => sum + item.fatG, 0);
    if (solveTarget.fatG - coveredFatG > 0) {
      warnings.push("No hay favoritos clasificados como fuente de grasa: el objetivo de grasa no se cubrió del todo.");
    }
  }

  // Relleno de porción fija (verdura o fruta según la comida): aporte menor, mejora lo realista del plato.
  if (fillerFood && !items.some((i) => i.food.id === fillerFood.id)) {
    addClampedItem(items, warnings, fillerFood, fillerGrams, maxGrams);
  }

  const totals = sumTotals(items);

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
