import { describe, expect, it } from "vitest";
import { formatCookedYield, formatHouseholdUnit } from "./format";

describe("formatHouseholdUnit", () => {
  it("devuelve null si el alimento no tiene medida casera definida", () => {
    expect(formatHouseholdUnit(100, null, null)).toBeNull();
    expect(formatHouseholdUnit(100, "1 taza", null)).toBeNull();
  });

  it("cuando la cantidad calculada da justo la unidad de referencia, muestra el nombre solo", () => {
    expect(formatHouseholdUnit(50, "1 huevo grande", 50)).toBe("1 huevo grande");
    expect(formatHouseholdUnit(51, "1 huevo grande", 50)).toBe("1 huevo grande");
  });

  it("cuando no da justo 1, muestra el múltiplo redondeado a un decimal", () => {
    expect(formatHouseholdUnit(122, "1/2 unidad", 100)).toBe("≈1.2 × 1/2 unidad");
    expect(formatHouseholdUnit(30, "1 puñado (6 unidades)", 30)).toBe("1 puñado (6 unidades)");
    expect(formatHouseholdUnit(60, "1 puñado (6 unidades)", 30)).toBe("≈2 × 1 puñado (6 unidades)");
  });
});

describe("formatCookedYield", () => {
  it("devuelve null si el alimento no está crudo, o no tiene factor cargado", () => {
    expect(formatCookedYield(100, "COOKED", 3)).toBeNull();
    expect(formatCookedYield(100, "RAW", null)).toBeNull();
    expect(formatCookedYield(100, "RAW", undefined)).toBeNull();
  });

  it("multiplica los gramos crudos por el factor de rendimiento", () => {
    expect(formatCookedYield(60, "RAW", 3)).toBe("≈180g cocido");
    expect(formatCookedYield(80, "RAW", 2.5)).toBe("≈200g cocido");
    expect(formatCookedYield(150, "RAW", 0.7)).toBe("≈105g cocido");
  });
});
