import { describe, expect, it } from "vitest";
import { harrisBenedictRevised, mifflinStJeor } from "./bmr";

describe("harrisBenedictRevised (Roza & Shizgal, 1984)", () => {
  it("hombre 30 años, 80kg, 175cm", () => {
    // 88.362 + 13.397*80 + 4.799*175 - 5.677*30
    const tmb = harrisBenedictRevised({ sex: "MALE", weightKg: 80, heightCm: 175, age: 30 });
    expect(tmb).toBeCloseTo(1829.637, 3);
  });

  it("mujer 25 años, 60kg, 165cm", () => {
    // 447.593 + 9.247*60 + 3.098*165 - 4.330*25
    const tmb = harrisBenedictRevised({ sex: "FEMALE", weightKg: 60, heightCm: 165, age: 25 });
    expect(tmb).toBeCloseTo(1405.333, 3);
  });
});

describe("mifflinStJeor (1990)", () => {
  it("hombre 30 años, 80kg, 175cm", () => {
    // 10*80 + 6.25*175 - 5*30 + 5 = 800 + 1093.75 - 150 + 5 = 1748.75
    // Nota: el enunciado menciona ~1798.75 como verificación, pero con los
    // coeficientes exactos (10, 6.25, 5, +5) el resultado correcto es 1748.75.
    const tmb = mifflinStJeor({ sex: "MALE", weightKg: 80, heightCm: 175, age: 30 });
    expect(tmb).toBeCloseTo(1748.75, 2);
  });

  it("mujer 25 años, 60kg, 165cm", () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    const tmb = mifflinStJeor({ sex: "FEMALE", weightKg: 60, heightCm: 165, age: 25 });
    expect(tmb).toBeCloseTo(1345.25, 2);
  });
});
