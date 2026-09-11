import { describe, expect, it } from "vitest";
import { calculateTdee } from "./tdee";

describe("calculateTdee", () => {
  const bmr = 1800;

  it("sedentario: x1.2", () => {
    expect(calculateTdee(bmr, "SEDENTARY")).toBeCloseTo(2160, 5);
  });

  it("ligero: x1.375", () => {
    expect(calculateTdee(bmr, "LIGHT")).toBeCloseTo(2475, 5);
  });

  it("moderado: x1.55", () => {
    expect(calculateTdee(bmr, "MODERATE")).toBeCloseTo(2790, 5);
  });

  it("intenso: x1.725", () => {
    expect(calculateTdee(bmr, "INTENSE")).toBeCloseTo(3105, 5);
  });

  it("muy intenso: x1.9", () => {
    expect(calculateTdee(bmr, "VERY_INTENSE")).toBeCloseTo(3420, 5);
  });
});
