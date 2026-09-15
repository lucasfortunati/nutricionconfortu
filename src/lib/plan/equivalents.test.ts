import { describe, expect, it } from "vitest";
import type { FoodItem } from "@prisma/client";
import { computeEquivalentOptions } from "./equivalents";

let nextId = 0;

function makeFood(overrides: Partial<FoodItem>): FoodItem {
  nextId += 1;
  return {
    id: `food-${nextId}`,
    name: "Alimento",
    category: "Carnes y aves",
    state: "COOKED",
    kcalPer100g: 100,
    proteinPer100g: 10,
    fatPer100g: 5,
    carbPer100g: 5,
    sodiumMgPer100g: null,
    householdUnitName: null,
    householdUnitGrams: null,
    source: "MANUAL",
    sourceDetail: null,
    status: "ACTIVE",
    suitableBreakfast: false,
    suitableMainMeal: true,
    cookedYieldFactor: null,
    vegetableGroup: null,
    currentVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("computeEquivalentOptions", () => {
  it("para un ítem de rol (ej. proteína de almuerzo), propone otros favoritos del mismo rol dimensionados a las mismas kcal", () => {
    const chicken = makeFood({
      id: "chicken",
      name: "Pechuga de pollo, cocida",
      category: "Carnes y aves",
      kcalPer100g: 165,
      proteinPer100g: 31,
      fatPer100g: 3.6,
      carbPer100g: 0,
      suitableMainMeal: true,
    });
    const fish = makeFood({
      id: "fish",
      name: "Merluza, cocida",
      category: "Pescados y mariscos",
      kcalPer100g: 112,
      proteinPer100g: 23,
      fatPer100g: 1.7,
      carbPer100g: 0,
      suitableMainMeal: true,
    });
    const rice = makeFood({
      id: "rice",
      name: "Arroz blanco, cocido",
      category: "Cereales y derivados",
      kcalPer100g: 130,
      proteinPer100g: 2.7,
      fatPer100g: 0.3,
      carbPer100g: 28.2,
      suitableMainMeal: true,
    });
    const tomato = makeFood({
      id: "tomato",
      name: "Tomate, crudo",
      category: "Verduras",
      kcalPer100g: 18,
      proteinPer100g: 0.9,
      fatPer100g: 0.2,
      carbPer100g: 3.9,
      suitableMainMeal: true,
      vegetableGroup: "A",
    });

    const currentItem = {
      category: "Carnes y aves",
      proteinPer100gSnap: 31,
      fatPer100gSnap: 3.6,
      carbPer100gSnap: 0,
      foodItemId: "chicken",
      computedKcal: 132, // 80g de pollo
    };

    const options = computeEquivalentOptions("Almuerzo", currentItem, [chicken, fish, rice, tomato]);

    const ids = options.map((o) => o.foodId);
    expect(ids).toContain("fish");
    expect(ids).not.toContain("chicken"); // nunca se propone a sí mismo
    expect(ids).not.toContain("rice"); // otro rol (carbohidrato)
    expect(ids).not.toContain("tomato"); // es el relleno, no un rol

    const fishOption = options.find((o) => o.foodId === "fish")!;
    // 132 kcal / (112 kcal/100g) * 100 = ~118g
    expect(fishOption.grams).toBe(118);
    expect(fishOption.kcal).toBeCloseTo(132, 0);
  });

  it("para el relleno (fruta/verdura), propone otros favoritos de la misma categoría", () => {
    const tomato = makeFood({
      id: "tomato",
      name: "Tomate, crudo",
      category: "Verduras",
      kcalPer100g: 18,
      proteinPer100g: 0.9,
      fatPer100g: 0.2,
      carbPer100g: 3.9,
      suitableMainMeal: true,
      vegetableGroup: "A",
    });
    const carrot = makeFood({
      id: "carrot",
      name: "Zanahoria, cruda",
      category: "Verduras",
      kcalPer100g: 41,
      proteinPer100g: 0.9,
      fatPer100g: 0.2,
      carbPer100g: 9.6,
      suitableMainMeal: true,
      vegetableGroup: "B",
    });
    const chicken = makeFood({ id: "chicken", category: "Carnes y aves", suitableMainMeal: true });

    const currentItem = {
      category: "Verduras",
      proteinPer100gSnap: 0.9,
      fatPer100gSnap: 0.2,
      carbPer100gSnap: 3.9,
      foodItemId: "tomato",
      computedKcal: 18,
    };

    const options = computeEquivalentOptions("Cena", currentItem, [tomato, carrot, chicken]);

    expect(options.map((o) => o.foodId)).toEqual(["carrot"]);
  });

  it("en desayuno/merienda usa la clasificación por categoría y la categoría de relleno de fruta", () => {
    const yogurt = makeFood({
      id: "yogurt",
      name: "Yogur natural descremado",
      category: "Lácteos",
      kcalPer100g: 41,
      proteinPer100g: 4,
      fatPer100g: 0.2,
      carbPer100g: 5.9,
      suitableBreakfast: true,
    });
    const egg = makeFood({
      id: "egg",
      name: "Huevo entero, cocido (duro)",
      category: "Huevos",
      kcalPer100g: 155,
      proteinPer100g: 12.6,
      fatPer100g: 10.6,
      carbPer100g: 1.1,
      suitableBreakfast: true,
    });
    const bread = makeFood({
      id: "bread",
      name: "Pan lactal blanco",
      category: "Cereales y derivados",
      kcalPer100g: 250,
      proteinPer100g: 8,
      fatPer100g: 3,
      carbPer100g: 48,
      suitableBreakfast: true,
    });

    const currentItem = {
      category: "Lácteos",
      proteinPer100gSnap: 4,
      fatPer100gSnap: 0.2,
      carbPer100gSnap: 5.9,
      foodItemId: "yogurt",
      computedKcal: 100,
    };

    const options = computeEquivalentOptions("Desayuno", currentItem, [yogurt, egg, bread]);

    // Huevo también clasifica PROTEIN por categoría en desayuno; pan es CARB, no debería aparecer.
    expect(options.map((o) => o.foodId)).toEqual(["egg"]);
  });
});
