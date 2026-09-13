import { describe, expect, it } from "vitest";
import { distributeMealTargets, getDefaultMealSplit, isValidMealSplit } from "./mealSplit";

describe("getDefaultMealSplit", () => {
  it("devuelve el preset de 3 comidas y suma 100", () => {
    const split = getDefaultMealSplit(3);
    expect(split.map((s) => s.name)).toEqual(["Desayuno", "Almuerzo", "Cena"]);
    expect(isValidMealSplit(split)).toBe(true);
  });

  it("devuelve el preset de 6 comidas y suma 100", () => {
    const split = getDefaultMealSplit(6);
    expect(split).toHaveLength(6);
    expect(isValidMealSplit(split)).toBe(true);
  });

  it("genera un reparto parejo cuando no hay preset, y sigue sumando 100", () => {
    const split = getDefaultMealSplit(7);
    expect(split).toHaveLength(7);
    expect(isValidMealSplit(split)).toBe(true);
  });
});

describe("isValidMealSplit", () => {
  it("rechaza un reparto que no suma 100", () => {
    expect(isValidMealSplit([{ name: "A", pct: 50 }, { name: "B", pct: 40 }])).toBe(false);
  });
});

describe("distributeMealTargets", () => {
  it("reparte proporcionalmente los macros diarios entre comidas", () => {
    const daily = { kcal: 2000, proteinG: 150, fatG: 65, carbG: 200 };
    const splits = [
      { name: "Desayuno", pct: 25 },
      { name: "Almuerzo", pct: 75 },
    ];

    const [desayuno, almuerzo] = distributeMealTargets(daily, splits);

    expect(desayuno).toMatchObject({ name: "Desayuno", pct: 25, kcal: 500, proteinG: 37.5, fatG: 16.25, carbG: 50 });
    expect(almuerzo).toMatchObject({ name: "Almuerzo", pct: 75, kcal: 1500, proteinG: 112.5, fatG: 48.75, carbG: 150 });
  });
});
