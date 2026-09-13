"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BMR_FORMULA_LABELS, GOAL_TYPE_LABELS } from "@/lib/nutrition/labels";
import { formatHouseholdUnit } from "@/lib/plan/format";

type PlanWithMeals = Prisma.PlanGetPayload<{ include: { meals: { include: { items: true } } } }>;

function pct(actual: number, target: number): number {
  return target > 0 ? Math.round((actual / target) * 100) : 0;
}

export default function PlanDetailPage({ params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id: profileId, planId } = use(params);
  const [plan, setPlan] = useState<PlanWithMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingMealId, setRegeneratingMealId] = useState<string | null>(null);
  const [mealWarnings, setMealWarnings] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/plans/${planId}`);
    setPlan(await res.json());
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    // Carga inicial del plan; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRegenerate(mealId: string) {
    setRegeneratingMealId(mealId);
    try {
      const res = await fetch(`/api/plans/${planId}/meals/${mealId}/regenerate`, { method: "POST" });
      const outcome = await res.json();
      setPlan((prev) => (prev ? { ...prev, meals: prev.meals.map((m) => (m.id === mealId ? outcome.meal : m)) } : prev));
      setMealWarnings((prev) => ({ ...prev, [mealId]: outcome.warnings ?? [] }));
    } finally {
      setRegeneratingMealId(null);
    }
  }

  if (loading || !plan) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>;
  }

  const dailyTotals = plan.meals.reduce(
    (acc, meal) => {
      const mealTotals = meal.items.reduce(
        (a, i) => ({
          kcal: a.kcal + i.computedKcal,
          protein: a.protein + i.computedProtein,
          fat: a.fat + i.computedFat,
          carb: a.carb + i.computedCarb,
        }),
        { kcal: 0, protein: 0, fat: 0, carb: 0 },
      );
      return {
        kcal: acc.kcal + mealTotals.kcal,
        protein: acc.protein + mealTotals.protein,
        fat: acc.fat + mealTotals.fat,
        carb: acc.carb + mealTotals.carb,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carb: 0 },
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/perfiles/${profileId}/plan`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Volver a mis planes
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {plan.label ?? new Date(plan.createdAt).toLocaleDateString("es-AR")}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {BMR_FORMULA_LABELS[plan.formula]} · {GOAL_TYPE_LABELS[plan.goalType]} · {Math.round(plan.targetKcal)} kcal
            objetivo
          </p>
        </div>
        <a
          href={`/api/plans/${plan.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
        >
          Exportar a PDF
        </a>
      </header>

      <div className="flex flex-col gap-4">
        {plan.meals.map((meal) => {
          const mealTotals = meal.items.reduce(
            (a, i) => ({
              kcal: a.kcal + i.computedKcal,
              protein: a.protein + i.computedProtein,
              fat: a.fat + i.computedFat,
              carb: a.carb + i.computedCarb,
            }),
            { kcal: 0, protein: 0, fat: 0, carb: 0 },
          );

          return (
            <section key={meal.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{meal.name}</h2>
                <button
                  onClick={() => handleRegenerate(meal.id)}
                  disabled={regeneratingMealId === meal.id}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                >
                  {regeneratingMealId === meal.id ? "Regenerando…" : "Regenerar"}
                </button>
              </div>

              {mealWarnings[meal.id]?.map((w, i) => (
                <p key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {w}
                </p>
              ))}

              <ul className="flex flex-col gap-2">
                {meal.items.map((item) => {
                  const householdText = formatHouseholdUnit(item.grams, item.householdUnitName, item.householdUnitGrams);
                  return (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-zinc-900 dark:text-zinc-50">{item.foodName}</span>
                        <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                          {item.grams}g{householdText ? ` (${householdText})` : ""}
                        </span>
                      </div>
                      <span className="text-zinc-500 dark:text-zinc-400">{Math.round(item.computedKcal)} kcal</span>
                    </li>
                  );
                })}
              </ul>

              <div className="grid grid-cols-4 gap-2 border-t border-zinc-100 pt-2 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <div>
                  {Math.round(mealTotals.kcal)}/{Math.round(meal.targetKcal)} kcal ({pct(mealTotals.kcal, meal.targetKcal)}%)
                </div>
                <div>
                  P {Math.round(mealTotals.protein)}/{Math.round(meal.targetProteinG)}g
                </div>
                <div>
                  G {Math.round(mealTotals.fat)}/{Math.round(meal.targetFatG)}g
                </div>
                <div>
                  C {Math.round(mealTotals.carb)}/{Math.round(meal.targetCarbG)}g
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">Totales del día vs. objetivo</h2>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(dailyTotals.kcal)}/{Math.round(plan.targetKcal)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">kcal</div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(dailyTotals.protein)}/{Math.round(plan.targetProteinG)}g
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Proteína</div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(dailyTotals.fat)}/{Math.round(plan.targetFatG)}g
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Grasa</div>
          </div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-50">
              {Math.round(dailyTotals.carb)}/{Math.round(plan.targetCarbG)}g
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Carbohidrato</div>
          </div>
        </div>
      </section>
    </div>
  );
}
