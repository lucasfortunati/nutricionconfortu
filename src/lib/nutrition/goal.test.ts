import { describe, expect, it } from "vitest";
import { applyGoalAdjustment, clampAdjustmentPct } from "./goal";

describe("clampAdjustmentPct", () => {
  it("mantenimiento siempre es 0, sin importar lo que se pase", () => {
    expect(clampAdjustmentPct("MAINTENANCE", -10)).toBe(0);
    expect(clampAdjustmentPct("MAINTENANCE", 10)).toBe(0);
  });

  it("déficit dentro de rango se respeta", () => {
    expect(clampAdjustmentPct("LOSS", -18)).toBe(-18);
  });

  it("déficit no puede superar el tope de -25%", () => {
    expect(clampAdjustmentPct("LOSS", -40)).toBe(-25);
  });

  it("déficit no puede ser positivo", () => {
    expect(clampAdjustmentPct("LOSS", 10)).toBe(0);
  });

  it("superávit no puede ser negativo", () => {
    expect(clampAdjustmentPct("GAIN", -5)).toBe(0);
  });

  it("superávit dentro de rango se respeta", () => {
    expect(clampAdjustmentPct("GAIN", 12.5)).toBe(12.5);
  });
});

describe("applyGoalAdjustment", () => {
  it("aplica déficit sobre el GET", () => {
    expect(applyGoalAdjustment(2000, "LOSS", -20)).toBeCloseTo(1600, 5);
  });

  it("aplica superávit sobre el GET", () => {
    expect(applyGoalAdjustment(2000, "GAIN", 15)).toBeCloseTo(2300, 5);
  });

  it("mantenimiento no modifica el GET", () => {
    expect(applyGoalAdjustment(2000, "MAINTENANCE", 0)).toBeCloseTo(2000, 5);
  });
});
