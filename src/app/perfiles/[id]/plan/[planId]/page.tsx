"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BMR_FORMULA_LABELS, GOAL_TYPE_LABELS } from "@/lib/nutrition/labels";
import { formatCookedYield, formatHouseholdUnit } from "@/lib/plan/format";
import type { EquivalentOption } from "@/lib/plan/equivalents";

type PlanWithMeals = Prisma.PlanGetPayload<{
  include: {
    meals: { include: { items: { include: { foodItem: { select: { cookedYieldFactor: true } } } } } };
  };
}>;

function pct(actual: number, target: number): number {
  return target > 0 ? Math.round((actual / target) * 100) : 0;
}

export default function PlanDetailPage({ params }: { params: Promise<{ id: string; planId: string }> }) {
  const { id: profileId, planId } = use(params);
  const [plan, setPlan] = useState<PlanWithMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingMealId, setRegeneratingMealId] = useState<string | null>(null);
  const [mealWarnings, setMealWarnings] = useState<Record<string, string[]>>({});
  const [openOptionsItemId, setOpenOptionsItemId] = useState<string | null>(null);
  const [optionsByItemId, setOptionsByItemId] = useState<Record<string, EquivalentOption[]>>({});
  const [loadingOptionsItemId, setLoadingOptionsItemId] = useState<string | null>(null);
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);

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

  async function handleToggleOptions(mealId: string, itemId: string) {
    if (openOptionsItemId === itemId) {
      setOpenOptionsItemId(null);
      return;
    }
    setOpenOptionsItemId(itemId);
    if (!optionsByItemId[itemId]) {
      setLoadingOptionsItemId(itemId);
      try {
        const res = await fetch(`/api/plans/${planId}/meals/${mealId}/items/${itemId}/equivalents`);
        const options = await res.json();
        setOptionsByItemId((prev) => ({ ...prev, [itemId]: options }));
      } finally {
        setLoadingOptionsItemId(null);
      }
    }
  }

  async function handleSwap(mealId: string, itemId: string, foodItemId: string) {
    setSwappingItemId(itemId);
    try {
      const res = await fetch(`/api/plans/${planId}/meals/${mealId}/items/${itemId}/swap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodItemId }),
      });
      const updatedItem = await res.json();
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              meals: prev.meals.map((m) =>
                m.id === mealId
                  ? { ...m, items: m.items.map((i) => (i.id === itemId ? updatedItem : i)) }
                  : m,
              ),
            }
          : prev,
      );
      setOptionsByItemId((prev) => {
        const rest = { ...prev };
        delete rest[itemId];
        return rest;
      });
      setOpenOptionsItemId(null);
    } finally {
      setSwappingItemId(null);
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
                  const cookedYieldText = formatCookedYield(item.grams, item.state, item.foodItem?.cookedYieldFactor);
                  const optionsOpen = openOptionsItemId === item.id;
                  const options = optionsByItemId[item.id];
                  return (
                    <li key={item.id} className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-zinc-900 dark:text-zinc-50">{item.foodName}</span>
                          <span className="ml-2 text-zinc-700 dark:text-zinc-300">
                            {householdText ?? `${item.grams}g`}
                          </span>
                          {householdText && (
                            <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-500">({item.grams}g)</span>
                          )}
                          {cookedYieldText && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">{cookedYieldText}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 dark:text-zinc-400">{Math.round(item.computedKcal)} kcal</span>
                          <button
                            onClick={() => handleToggleOptions(meal.id, item.id)}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {optionsOpen ? "Cerrar" : "Cambiar"}
                          </button>
                        </div>
                      </div>

                      {optionsOpen && (
                        <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            Alternativas con aproximadamente las mismas calorías:
                          </span>
                          {loadingOptionsItemId === item.id && (
                            <span className="text-xs text-zinc-400">Buscando opciones…</span>
                          )}
                          {options?.length === 0 && (
                            <span className="text-xs text-zinc-400">
                              No hay otro favorito equivalente para este ítem.
                            </span>
                          )}
                          {options?.map((opt) => {
                            const optHousehold = formatHouseholdUnit(opt.grams, opt.householdUnitName, opt.householdUnitGrams);
                            return (
                              <button
                                key={opt.foodId}
                                onClick={() => handleSwap(meal.id, item.id, opt.foodId)}
                                disabled={swappingItemId === item.id}
                                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2 py-1 text-left text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                              >
                                <span className="text-zinc-800 dark:text-zinc-200">
                                  {opt.foodName}{" "}
                                  <span className="text-zinc-500 dark:text-zinc-400">
                                    ({optHousehold ?? `${opt.grams}g`}
                                    {optHousehold ? `, ${opt.grams}g` : ""})
                                  </span>
                                </span>
                                <span className="text-zinc-500 dark:text-zinc-400">{Math.round(opt.kcal)} kcal</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
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
