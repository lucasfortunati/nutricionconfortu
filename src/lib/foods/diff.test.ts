import { describe, expect, it } from "vitest";
import { computeChangedFields } from "./diff";

describe("computeChangedFields", () => {
  it("detecta un campo modificado", () => {
    const prev = { name: "Banana", kcalPer100g: 89, status: "ACTIVE" };
    const next = { name: "Banana", kcalPer100g: 55, status: "ACTIVE" };
    expect(computeChangedFields(prev, next)).toEqual(["kcalPer100g"]);
  });

  it("no marca cambios cuando los valores son iguales", () => {
    const prev = { name: "Banana", kcalPer100g: 89 };
    const next = { name: "Banana", kcalPer100g: 89 };
    expect(computeChangedFields(prev, next)).toEqual([]);
  });

  it("no confunde un campo ausente (undefined) con un cambio real, tratándolo como null", () => {
    // Si un caller compara contra un objeto que no trae `status`, no debe
    // aparecer como "cambiado" solo porque quedó undefined vs el valor previo.
    const prev = { status: "ACTIVE" };
    const next = { status: "ACTIVE" };
    expect(computeChangedFields(prev, next)).toEqual([]);
  });

  it("sí detecta cuando null pasa a tener un valor", () => {
    const prev = { sodiumMgPer100g: null };
    const next = { sodiumMgPer100g: 120 };
    expect(computeChangedFields(prev, next)).toEqual(["sodiumMgPer100g"]);
  });
});
