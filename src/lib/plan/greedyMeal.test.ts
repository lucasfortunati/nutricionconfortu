import { describe, expect, it } from "vitest";
import { classifyBreakfastRole } from "./foodRole";
import { buildMealGreedy, type CandidateFood } from "./greedyMeal";

// Alimentos sintéticos "puros" (sin cross-contaminación de macros) para poder
// calcular a mano el resultado esperado exacto.
const pureProtein: CandidateFood = {
  id: "protein-1",
  name: "Proteína pura",
  category: "Carnes y aves",
  kcalPer100g: 400,
  proteinPer100g: 100,
  fatPer100g: 0,
  carbPer100g: 0,
};
const pureCarb: CandidateFood = {
  id: "carb-1",
  name: "Carbohidrato puro",
  category: "Cereales y derivados",
  kcalPer100g: 400,
  proteinPer100g: 0,
  fatPer100g: 0,
  carbPer100g: 100,
};
const pureFat: CandidateFood = {
  id: "fat-1",
  name: "Grasa pura",
  category: "Grasas y aceites",
  kcalPer100g: 900,
  proteinPer100g: 0,
  fatPer100g: 100,
  carbPer100g: 0,
};

describe("buildMealGreedy", () => {
  it("resuelve las cantidades exactas cuando los alimentos no tienen cross-contaminación de macros", () => {
    const target = { kcal: 410, proteinG: 30, fatG: 10, carbG: 50 };
    const result = buildMealGreedy(target, [pureProtein, pureCarb, pureFat], { random: () => 0 });

    expect(result.items).toHaveLength(3);
    expect(result.items.find((i) => i.food.id === "protein-1")?.grams).toBe(30);
    expect(result.items.find((i) => i.food.id === "carb-1")?.grams).toBe(50);
    expect(result.items.find((i) => i.food.id === "fat-1")?.grams).toBe(10);

    expect(result.totals).toEqual({ kcal: 410, proteinG: 30, fatG: 10, carbG: 50 });
    expect(result.withinTolerance).toEqual({ kcal: true, proteinG: true, fatG: true, carbG: true });
    expect(result.warnings).toEqual([]);
  });

  it("corrige la proteína hacia abajo cuando el carbohidrato elegido también aporta proteína real", () => {
    // Regresión de un bug real: pollo + arroz + aceite terminaba ~30% por
    // encima del objetivo de proteína porque el arroz también aporta proteína
    // y la primera pasada no lo descontaba (a diferencia de carbohidrato y
    // grasa, que sí se resuelven restando lo ya cubierto).
    const chicken: CandidateFood = {
      id: "chicken",
      name: "Pechuga de pollo, cruda",
      category: "Carnes y aves",
      kcalPer100g: 120,
      proteinPer100g: 22.5,
      fatPer100g: 2.6,
      carbPer100g: 0,
    };
    const rice: CandidateFood = {
      id: "rice",
      name: "Arroz blanco, cocido",
      category: "Cereales y derivados",
      kcalPer100g: 130,
      proteinPer100g: 2.7,
      fatPer100g: 0.3,
      carbPer100g: 28.2,
    };
    const oil: CandidateFood = {
      id: "oil",
      name: "Aceite de oliva",
      category: "Grasas y aceites",
      kcalPer100g: 884,
      proteinPer100g: 0,
      fatPer100g: 100,
      carbPer100g: 0,
    };
    const target = { kcal: 500, proteinG: 30, fatG: 15, carbG: 60 };

    const result = buildMealGreedy(target, [chicken, rice, oil], { random: () => 0 });

    // Sin la corrección, daría 133g (30/22.5*100); con la corrección baja a 108g.
    expect(result.items.find((i) => i.food.id === "chicken")?.grams).toBe(108);
    expect(result.totals.proteinG).toBeCloseTo(30, 0);
    expect(result.withinTolerance.proteinG).toBe(true);
  });

  it("avisa y deja el macro sin cubrir cuando falta un rol entre los favoritos", () => {
    const target = { kcal: 410, proteinG: 30, fatG: 10, carbG: 50 };
    const result = buildMealGreedy(target, [pureProtein, pureCarb], { random: () => 0 });

    expect(result.items.map((i) => i.food.id)).toEqual(["protein-1", "carb-1"]);
    expect(result.totals.fatG).toBe(0);
    expect(result.withinTolerance.fatG).toBe(false);
    expect(result.warnings.some((w) => w.includes("fuente de grasa"))).toBe(true);
  });

  it("agrega una verdura de relleno de porción fija cuando hay una favorita disponible", () => {
    const veggie: CandidateFood = {
      id: "veg-1",
      name: "Brócoli",
      category: "Verduras",
      kcalPer100g: 35,
      proteinPer100g: 2.4,
      fatPer100g: 0.4,
      carbPer100g: 7.2,
    };
    const target = { kcal: 410, proteinG: 30, fatG: 10, carbG: 50 };
    const result = buildMealGreedy(target, [pureProtein, pureCarb, pureFat, veggie], { random: () => 0 });

    const veggieItem = result.items.find((i) => i.food.id === "veg-1");
    expect(veggieItem?.grams).toBe(100);
  });

  it("nunca usa una verdura como fuente principal de un macro, solo como relleno de porción fija", () => {
    // El brócoli clasifica como "CARB" por su ratio de macros, pero su densidad
    // calórica es tan baja que usarlo como fuente principal de carbohidratos
    // pediría una porción irreal (>1kg). Regresión del bug real encontrado
    // probando el generador de planes end-to-end.
    const broccoli: CandidateFood = {
      id: "veg-carb",
      name: "Brócoli, cocido",
      category: "Verduras",
      kcalPer100g: 35,
      proteinPer100g: 2.4,
      fatPer100g: 0.4,
      carbPer100g: 7.2,
    };
    const target = { kcal: 410, proteinG: 30, fatG: 10, carbG: 50 };
    const result = buildMealGreedy(target, [pureProtein, broccoli, pureFat], { random: () => 0 });

    const occurrences = result.items.filter((i) => i.food.id === "veg-carb");
    expect(occurrences).toHaveLength(1);
    // Debe entrar con la porción fija de relleno (100g), no con la cantidad
    // enorme que pediría el solve de carbohidratos (aviso de "no hay fuente").
    expect(occurrences[0].grams).toBe(100);
    expect(result.warnings.some((w) => w.includes("fuente de carbohidrato"))).toBe(true);
  });

  it("limita la cantidad por ítem a maxGramsPerItem y avisa cuando se activa el tope", () => {
    const target = { kcal: 4000, proteinG: 700, fatG: 10, carbG: 0 };
    const result = buildMealGreedy(target, [pureProtein], { random: () => 0, maxGramsPerItem: 500 });

    const proteinItem = result.items.find((i) => i.food.id === "protein-1");
    expect(proteinItem?.grams).toBe(500);
    expect(result.warnings.some((w) => w.includes("se limitó a 500g"))).toBe(true);
  });

  it("sin candidatos, no genera ítems y avisa de los tres macros", () => {
    const target = { kcal: 410, proteinG: 30, fatG: 10, carbG: 50 };
    const result = buildMealGreedy(target, [], { random: () => 0 });

    expect(result.items).toEqual([]);
    expect(result.totals).toEqual({ kcal: 0, proteinG: 0, fatG: 0, carbG: 0 });
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it("con roleClassifier y fillerCategory de desayuno, arma la comida con pan/huevo/nueces/fruta y nunca elige carne", () => {
    // Regresión del bug real reportado: sin este modo, "Pechuga de pollo"
    // (proteína pura por kcal) terminaba elegida para el desayuno.
    const chicken: CandidateFood = {
      id: "chicken",
      name: "Pechuga de pollo, cruda",
      category: "Carnes y aves",
      kcalPer100g: 120,
      proteinPer100g: 22.5,
      fatPer100g: 2.6,
      carbPer100g: 0,
    };
    const egg: CandidateFood = {
      id: "egg",
      name: "Huevo entero, crudo",
      category: "Huevos",
      kcalPer100g: 143,
      proteinPer100g: 12.6,
      fatPer100g: 9.5,
      carbPer100g: 0.7,
    };
    const bread: CandidateFood = {
      id: "bread",
      name: "Pan lactal blanco",
      category: "Cereales y derivados",
      kcalPer100g: 250,
      proteinPer100g: 8,
      fatPer100g: 3,
      carbPer100g: 48,
    };
    const nuts: CandidateFood = {
      id: "nuts",
      name: "Nuez",
      category: "Frutos secos y semillas",
      kcalPer100g: 654,
      proteinPer100g: 15.2,
      fatPer100g: 65.2,
      carbPer100g: 13.7,
    };
    const apple: CandidateFood = {
      id: "apple",
      name: "Manzana",
      category: "Frutas",
      kcalPer100g: 52,
      proteinPer100g: 0.3,
      fatPer100g: 0.2,
      carbPer100g: 13.8,
    };

    const target = { kcal: 400, proteinG: 20, fatG: 15, carbG: 50 };
    const result = buildMealGreedy(target, [chicken, egg, bread, nuts, apple], {
      random: () => 0,
      roleClassifier: classifyBreakfastRole,
      fillerCategory: "Frutas",
    });

    const chosenIds = result.items.map((i) => i.food.id);
    expect(chosenIds).not.toContain("chicken");
    expect(chosenIds).toContain("egg");
    expect(chosenIds).toContain("bread");
    expect(chosenIds).toContain("apple");
  });

  it("resuelve el sistema exacto cuando los tres alimentos aportan de más de un macro a la vez", () => {
    // Regresión de un bug real: con alimentos reales (avena, nuez, yogur) el
    // armado secuencial anterior solo ajustaba la proteína al final y dejaba
    // grasa/carbohidrato con bastante error porque avena aporta proteína real
    // y nuez aporta carbohidrato real. El sistema de 3 ecuaciones y 3
    // incógnitas debe calzar los tres macros con un margen mucho más chico
    // que el ±10% general.
    const oats: CandidateFood = {
      id: "oats",
      name: "Avena arrollada, cruda",
      category: "Cereales y derivados",
      kcalPer100g: 389,
      proteinPer100g: 16.9,
      fatPer100g: 6.9,
      carbPer100g: 66.3,
    };
    const nuts: CandidateFood = {
      id: "nuts",
      name: "Nuez",
      category: "Frutos secos y semillas",
      kcalPer100g: 654,
      proteinPer100g: 15.2,
      fatPer100g: 65.2,
      carbPer100g: 13.7,
    };
    const yogurt: CandidateFood = {
      id: "yogurt",
      name: "Yogur natural descremado",
      category: "Lácteos",
      kcalPer100g: 41,
      proteinPer100g: 4,
      fatPer100g: 0.2,
      carbPer100g: 5.9,
    };
    const target = { kcal: 400, proteinG: 20, fatG: 12, carbG: 55 };

    const result = buildMealGreedy(target, [yogurt, oats, nuts], {
      random: () => 0,
      roleClassifier: classifyBreakfastRole,
      fillerCategory: "Frutas",
    });

    expect(result.totals.proteinG).toBeCloseTo(target.proteinG, 1);
    expect(result.totals.fatG).toBeCloseTo(target.fatG, 1);
    expect(result.totals.carbG).toBeCloseTo(target.carbG, 1);
    expect(result.withinTolerance).toEqual({ kcal: true, proteinG: true, fatG: true, carbG: true });
    expect(result.warnings).toEqual([]);
  });
});
