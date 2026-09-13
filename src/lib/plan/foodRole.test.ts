import { describe, expect, it } from "vitest";
import { classifyFoodRole } from "./foodRole";

describe("classifyFoodRole", () => {
  it("clasifica la pechuga de pollo como fuente de proteína", () => {
    expect(classifyFoodRole({ proteinPer100g: 22.5, fatPer100g: 2.6, carbPer100g: 0 })).toBe("PROTEIN");
  });

  it("clasifica el arroz cocido como fuente de carbohidrato", () => {
    expect(classifyFoodRole({ proteinPer100g: 2.7, fatPer100g: 0.3, carbPer100g: 28.2 })).toBe("CARB");
  });

  it("clasifica el aceite de oliva como fuente de grasa", () => {
    expect(classifyFoodRole({ proteinPer100g: 0, fatPer100g: 100, carbPer100g: 0 })).toBe("FAT");
  });

  it("clasifica la palta como fuente de grasa (predomina sobre el carbohidrato)", () => {
    expect(classifyFoodRole({ proteinPer100g: 2, fatPer100g: 14.7, carbPer100g: 8.5 })).toBe("FAT");
  });

  it("clasifica alimentos casi sin macros como OTHER, no como fuente de nada", () => {
    expect(classifyFoodRole({ proteinPer100g: 0.2, fatPer100g: 0, carbPer100g: 0.5 })).toBe("OTHER");
  });
});
