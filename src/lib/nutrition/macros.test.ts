import { describe, expect, it } from "vitest";
import { calculateMacroDistribution, isFatGPerKgValid, isProteinGPerKgInRange } from "./macros";

describe("calculateMacroDistribution", () => {
  it("reparte proteína, grasa y carbohidratos como resto de las calorías", () => {
    // 80kg, 2000kcal, 2.0 g/kg proteína (160g = 640kcal), 1.0 g/kg grasa (80g = 720kcal)
    // resto: 2000 - 640 - 720 = 640kcal => 160g carbohidratos
    const result = calculateMacroDistribution({
      weightKg: 80,
      targetKcal: 2000,
      proteinGPerKg: 2.0,
      fatGPerKg: 1.0,
    });

    expect(result.proteinG).toBeCloseTo(160, 5);
    expect(result.fatG).toBeCloseTo(80, 5);
    expect(result.carbG).toBeCloseTo(160, 5);
    expect(result.proteinKcal).toBeCloseTo(640, 5);
    expect(result.fatKcal).toBeCloseTo(720, 5);
    expect(result.carbKcal).toBeCloseTo(640, 5);
    expect(result.proteinPct).toBeCloseTo(32, 5);
    expect(result.fatPct).toBeCloseTo(36, 5);
    expect(result.carbPct).toBeCloseTo(32, 5);
    expect(result.warning).toBeUndefined();
  });

  it("avisa y no da negativo cuando proteína+grasa superan las calorías objetivo", () => {
    // 100kg, 1200kcal, 2.2 g/kg proteína (220g = 880kcal), 1.2 g/kg grasa (120g = 1080kcal)
    // 880 + 1080 = 1960kcal > 1200kcal objetivo
    const result = calculateMacroDistribution({
      weightKg: 100,
      targetKcal: 1200,
      proteinGPerKg: 2.2,
      fatGPerKg: 1.2,
    });

    expect(result.carbG).toBe(0);
    expect(result.warning).toBeDefined();
  });

  it("rechaza grasas por debajo del piso de 0.5 g/kg", () => {
    expect(() =>
      calculateMacroDistribution({ weightKg: 80, targetKcal: 2000, proteinGPerKg: 2.0, fatGPerKg: 0.3 }),
    ).toThrow();
  });
});

describe("isProteinGPerKgInRange", () => {
  it("valida los rangos por objetivo", () => {
    expect(isProteinGPerKgInRange("LOSS", 2.0)).toBe(true);
    expect(isProteinGPerKgInRange("LOSS", 1.5)).toBe(false);
    expect(isProteinGPerKgInRange("MAINTENANCE", 1.8)).toBe(true);
    expect(isProteinGPerKgInRange("GAIN", 2.4)).toBe(true);
    expect(isProteinGPerKgInRange("GAIN", 2.5)).toBe(false);
  });
});

describe("isFatGPerKgValid", () => {
  it("nunca permite bajar de 0.5 g/kg", () => {
    expect(isFatGPerKgValid(0.5)).toBe(true);
    expect(isFatGPerKgValid(0.49)).toBe(false);
  });
});
