import { describe, expect, it } from "vitest";
import { classifyBreakfastRole, classifyFoodRole } from "./foodRole";

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

describe("classifyBreakfastRole", () => {
  // Por categoría, no por kcal: el huevo es "FAT" con classifyFoodRole (la
  // yema pesa más en kcal que la clara), pero en un desayuno argentino es la
  // fuente de proteína — regresión del bug real reportado (pollo en el
  // desayuno) donde además se vio que el heurístico por kcal no sirve acá.
  it("clasifica huevos y lácteos como proteína", () => {
    expect(classifyBreakfastRole({ category: "Huevos" })).toBe("PROTEIN");
    expect(classifyBreakfastRole({ category: "Lácteos" })).toBe("PROTEIN");
  });

  it("clasifica cereales y productos envasados como carbohidrato", () => {
    expect(classifyBreakfastRole({ category: "Cereales y derivados" })).toBe("CARB");
    expect(classifyBreakfastRole({ category: "Productos envasados" })).toBe("CARB");
  });

  it("clasifica frutos secos y aceites/grasas como grasa", () => {
    expect(classifyBreakfastRole({ category: "Frutos secos y semillas" })).toBe("FAT");
    expect(classifyBreakfastRole({ category: "Grasas y aceites" })).toBe("FAT");
  });

  it("no clasifica carnes ni verduras como nada (no son de desayuno)", () => {
    expect(classifyBreakfastRole({ category: "Carnes y aves" })).toBe("OTHER");
    expect(classifyBreakfastRole({ category: "Verduras" })).toBe("OTHER");
  });
});
