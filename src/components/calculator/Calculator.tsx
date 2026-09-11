"use client";

import { useEffect, useMemo, useState } from "react";
import { type BmrFormula, type Sex, calculateBmr } from "@/lib/nutrition/bmr";
import { type ActivityLevel, calculateTdee } from "@/lib/nutrition/tdee";
import { type GoalType, GOAL_ADJUSTMENT_DEFAULTS, applyGoalAdjustment, clampAdjustmentPct } from "@/lib/nutrition/goal";
import {
  FAT_G_PER_KG_RANGE,
  MIN_FAT_G_PER_KG,
  PROTEIN_G_PER_KG_RANGE,
  calculateMacroDistribution,
} from "@/lib/nutrition/macros";
import { ACTIVITY_LEVEL_LABELS, BMR_FORMULA_LABELS, GOAL_TYPE_LABELS } from "@/lib/nutrition/labels";
import { AGE_RANGE, HEIGHT_CM_RANGE, WEIGHT_KG_RANGE, isAgeValid, isHeightCmValid, isWeightKgValid } from "@/lib/validation/ranges";
import { MacroDonutChart, type MacroDonutDatum } from "./MacroDonutChart";

function midpoint([min, max]: [number, number]): number {
  return Math.round(((min + max) / 2) * 100) / 100;
}

export function Calculator() {
  const [sex, setSex] = useState<Sex>("FEMALE");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("165");
  const [weightKg, setWeightKg] = useState("65");
  const [formula, setFormula] = useState<BmrFormula>("MIFFLIN_ST_JEOR");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATE");
  const [goalType, setGoalType] = useState<GoalType>("MAINTENANCE");
  const [goalAdjustmentPct, setGoalAdjustmentPct] = useState(0);
  const [proteinGPerKg, setProteinGPerKg] = useState(midpoint(PROTEIN_G_PER_KG_RANGE.MAINTENANCE));
  const [fatGPerKg, setFatGPerKg] = useState(midpoint(FAT_G_PER_KG_RANGE));

  // Al cambiar de objetivo, proponemos defaults nuevos (el usuario puede volver a editar).
  useEffect(() => {
    setGoalAdjustmentPct(GOAL_ADJUSTMENT_DEFAULTS[goalType]);
    setProteinGPerKg(midpoint(PROTEIN_G_PER_KG_RANGE[goalType]));
  }, [goalType]);

  const ageNum = Number(age);
  const heightNum = Number(heightCm);
  const weightNum = Number(weightKg);

  const ageError = age !== "" && !isAgeValid(ageNum);
  const heightError = heightCm !== "" && !isHeightCmValid(heightNum);
  const weightError = weightKg !== "" && !isWeightKgValid(weightNum);

  const inputsValid =
    age !== "" && heightCm !== "" && weightKg !== "" && !ageError && !heightError && !weightError;

  const result = useMemo(() => {
    if (!inputsValid) return null;

    const bmr = calculateBmr(formula, { sex, weightKg: weightNum, heightCm: heightNum, age: ageNum });
    const tdee = calculateTdee(bmr, activityLevel);
    const clampedAdjustmentPct = clampAdjustmentPct(goalType, goalAdjustmentPct);
    const targetKcal = applyGoalAdjustment(tdee, goalType, goalAdjustmentPct);

    let macros: ReturnType<typeof calculateMacroDistribution> | null = null;
    let macroError: string | null = null;
    try {
      macros = calculateMacroDistribution({
        weightKg: weightNum,
        targetKcal,
        proteinGPerKg,
        fatGPerKg,
      });
    } catch (err) {
      macroError = err instanceof Error ? err.message : "No se pudieron calcular los macros.";
    }

    return { bmr, tdee, clampedAdjustmentPct, targetKcal, macros, macroError };
  }, [inputsValid, formula, sex, weightNum, heightNum, ageNum, activityLevel, goalType, goalAdjustmentPct, proteinGPerKg, fatGPerKg]);

  const chartData: MacroDonutDatum[] = result?.macros
    ? [
        { key: "protein", name: "Proteína", grams: result.macros.proteinG, kcal: result.macros.proteinKcal, pct: result.macros.proteinPct },
        { key: "fat", name: "Grasa", grams: result.macros.fatG, kcal: result.macros.fatKcal, pct: result.macros.fatPct },
        { key: "carb", name: "Carbohidratos", grams: result.macros.carbG, kcal: result.macros.carbKcal, pct: result.macros.carbPct },
      ]
    : [];

  const showAdjustment = goalType !== "MAINTENANCE";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tus datos</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Sexo</span>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="FEMALE">Femenino</option>
              <option value="MALE">Masculino</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Edad (años)</span>
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            {ageError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Debe estar entre {AGE_RANGE.min} y {AGE_RANGE.max} años.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Peso (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            {weightError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Debe estar entre {WEIGHT_KG_RANGE.min} y {WEIGHT_KG_RANGE.max} kg.
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Altura (cm)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            {heightError && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Debe estar entre {HEIGHT_CM_RANGE.min} y {HEIGHT_CM_RANGE.max} cm.
              </span>
            )}
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Fórmula de TMB</span>
          <select
            value={formula}
            onChange={(e) => setFormula(e.target.value as BmrFormula)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(BMR_FORMULA_LABELS) as BmrFormula[]).map((key) => (
              <option key={key} value={key}>
                {BMR_FORMULA_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Nivel de actividad</span>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(ACTIVITY_LEVEL_LABELS) as ActivityLevel[]).map((key) => (
              <option key={key} value={key}>
                {ACTIVITY_LEVEL_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Objetivo</span>
          <select
            value={goalType}
            onChange={(e) => setGoalType(e.target.value as GoalType)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(GOAL_TYPE_LABELS) as GoalType[]).map((key) => (
              <option key={key} value={key}>
                {GOAL_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        {showAdjustment && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">
              {goalType === "LOSS" ? "% de déficit" : "% de superávit"}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={goalAdjustmentPct}
              onChange={(e) => setGoalAdjustmentPct(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {goalType === "LOSS"
                ? "Sugerido -15% a -20%, tope -25%."
                : "Sugerido +10% a +15%."}
            </span>
          </label>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Proteína (g/kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={proteinGPerKg}
              onChange={(e) => setProteinGPerKg(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Recomendado {PROTEIN_G_PER_KG_RANGE[goalType][0]} - {PROTEIN_G_PER_KG_RANGE[goalType][1]} g/kg.
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Grasa (g/kg)</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={fatGPerKg}
              onChange={(e) => setFatGPerKg(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Recomendado {FAT_G_PER_KG_RANGE[0]} - {FAT_G_PER_KG_RANGE[1]} g/kg (nunca bajar de {MIN_FAT_G_PER_KG}).
            </span>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resultado</h2>

        {!result && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Completá tus datos con valores válidos para ver el cálculo.
          </p>
        )}

        {result && (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-zinc-500 dark:text-zinc-400">TMB ({BMR_FORMULA_LABELS[formula]})</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-50">
                {Math.round(result.bmr)} kcal
              </dd>

              <dt className="text-zinc-500 dark:text-zinc-400">GET (con actividad)</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-50">
                {Math.round(result.tdee)} kcal
              </dd>

              <dt className="text-zinc-500 dark:text-zinc-400">Ajuste por objetivo</dt>
              <dd className="text-right font-medium text-zinc-900 dark:text-zinc-50">
                {result.clampedAdjustmentPct > 0 ? "+" : ""}
                {result.clampedAdjustmentPct}%
              </dd>

              <dt className="font-semibold text-zinc-700 dark:text-zinc-200">Calorías objetivo</dt>
              <dd className="text-right text-base font-bold text-zinc-900 dark:text-zinc-50">
                {Math.round(result.targetKcal)} kcal
              </dd>
            </dl>

            {result.macroError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {result.macroError}
              </p>
            )}

            {result.macros && (
              <>
                {result.macros.warning && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {result.macros.warning}
                  </p>
                )}

                <ul className="grid grid-cols-3 gap-2 text-center text-sm">
                  <li className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {Math.round(result.macros.proteinG)}g
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Proteína ({result.macros.proteinPct.toFixed(0)}%)
                    </div>
                  </li>
                  <li className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {Math.round(result.macros.fatG)}g
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Grasa ({result.macros.fatPct.toFixed(0)}%)
                    </div>
                  </li>
                  <li className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {Math.round(result.macros.carbG)}g
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      Carbohidratos ({result.macros.carbPct.toFixed(0)}%)
                    </div>
                  </li>
                </ul>

                <MacroDonutChart data={chartData} />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
