"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";
import type { BmrFormula } from "@/lib/nutrition/bmr";
import type { ActivityLevel } from "@/lib/nutrition/tdee";
import { type GoalType, GOAL_ADJUSTMENT_DEFAULTS } from "@/lib/nutrition/goal";
import { PROTEIN_G_PER_KG_RANGE, FAT_G_PER_KG_RANGE } from "@/lib/nutrition/macros";
import { ACTIVITY_LEVEL_LABELS, BMR_FORMULA_LABELS, GOAL_TYPE_LABELS } from "@/lib/nutrition/labels";
import { DEFAULT_MEAL_SPLITS, getDefaultMealSplit, isValidMealSplit, type MealSplitEntry } from "@/lib/plan/mealSplit";

function midpoint([min, max]: [number, number]): number {
  return Math.round(((min + max) / 2) * 100) / 100;
}

interface CreatePlanOutcome {
  plan: { id: string };
  macroWarning: string | null;
  mealWarnings: { mealName: string; warnings: string[] }[];
}

export default function NuevoPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [formula, setFormula] = useState<BmrFormula>("MIFFLIN_ST_JEOR");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATE");
  const [goalType, setGoalType] = useState<GoalType>("MAINTENANCE");
  const [goalAdjustmentPct, setGoalAdjustmentPct] = useState(0);
  const [proteinGPerKg, setProteinGPerKg] = useState(midpoint(PROTEIN_G_PER_KG_RANGE.MAINTENANCE));
  const [fatGPerKg, setFatGPerKg] = useState(midpoint(FAT_G_PER_KG_RANGE));
  const [mealsCount, setMealsCount] = useState(3);
  const [mealSplit, setMealSplit] = useState<MealSplitEntry[]>(getDefaultMealSplit(3));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<CreatePlanOutcome | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/profiles/${profileId}`);
    setProfile(await res.json());
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    // Carga inicial del perfil para prellenar la calculadora; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // Al cambiar de objetivo, proponemos defaults nuevos (el usuario puede volver a editar).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGoalAdjustmentPct(GOAL_ADJUSTMENT_DEFAULTS[goalType]);
    setProteinGPerKg(midpoint(PROTEIN_G_PER_KG_RANGE[goalType]));
  }, [goalType]);

  function handleMealsCountChange(count: number) {
    setMealsCount(count);
    setMealSplit(getDefaultMealSplit(count));
  }

  function updateMealPct(index: number, pct: number) {
    setMealSplit((prev) => prev.map((entry, i) => (i === index ? { ...entry, pct } : entry)));
  }

  const splitSum = useMemo(() => mealSplit.reduce((sum, e) => sum + e.pct, 0), [mealSplit]);
  const splitValid = isValidMealSplit(mealSplit);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);

    if (!splitValid) {
      setError("El reparto de comidas debe sumar 100%.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sex: profile.sex,
          ageYears: profile.ageYears,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          formula,
          activityLevel,
          goalType,
          goalAdjustmentPct,
          proteinGPerKg,
          fatGPerKg,
          mealSplit,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "No se pudo generar el plan.");
      }
      setOutcome(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el plan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>;
  }

  if (outcome) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Plan generado ✓</h1>

        {outcome.macroWarning && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {outcome.macroWarning}
          </p>
        )}

        {outcome.mealWarnings.map((mw) => (
          <div key={mw.mealName} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <strong>{mw.mealName}:</strong>
            <ul className="ml-4 list-disc">
              {mw.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ))}

        <button
          onClick={() => router.push(`/perfiles/${profileId}/plan/${outcome.plan.id}`)}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Ver plan
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/perfiles/${profileId}/alimentos`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Volver
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Generar plan {profile ? `para ${profile.name}` : ""}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Se arma con tus alimentos favoritos. Necesitás al menos un favorito por rol (proteína, carbohidrato y
          grasa) para que salga completo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
        )}

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

        {goalType !== "MAINTENANCE" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">{goalType === "LOSS" ? "% de déficit" : "% de superávit"}</span>
            <input
              type="number"
              step="0.5"
              value={goalAdjustmentPct}
              onChange={(e) => setGoalAdjustmentPct(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Proteína (g/kg)</span>
            <input
              type="number"
              step="0.1"
              value={proteinGPerKg}
              onChange={(e) => setProteinGPerKg(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-700 dark:text-zinc-300">Grasa (g/kg)</span>
            <input
              type="number"
              step="0.1"
              value={fatGPerKg}
              onChange={(e) => setFatGPerKg(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Número de comidas diarias</span>
          <select
            value={mealsCount}
            onChange={(e) => handleMealsCountChange(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {Object.keys(DEFAULT_MEAL_SPLITS).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Reparto de calorías por comida (suma: {splitSum}%{!splitValid && " — debe ser 100%"})
          </span>
          {mealSplit.map((entry, index) => (
            <div key={entry.name + index} className="flex items-center gap-3">
              <span className="w-28 text-sm text-zinc-600 dark:text-zinc-400">{entry.name}</span>
              <input
                type="number"
                step="1"
                value={entry.pct}
                onChange={(e) => updateMealPct(index, Number(e.target.value))}
                className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting || !splitValid}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Generando…" : "Generar plan"}
        </button>
      </form>
    </div>
  );
}
