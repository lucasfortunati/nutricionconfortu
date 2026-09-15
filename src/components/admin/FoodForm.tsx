"use client";

import { useState } from "react";
import type { FoodItem } from "@prisma/client";
import { FOOD_CATEGORIES } from "@/lib/foods/categories";
import type { FoodInput } from "@/lib/foods/schema";

const STATE_LABELS = { RAW: "Crudo", COOKED: "Cocido", NA: "No aplica (envasado)" } as const;
const SOURCE_LABELS = { SARA2: "SARA 2 (ENNyS)", ANMAT: "ANMAT (Buscador Nutricional)", MANUAL: "Carga manual" } as const;

export interface FoodFormValues extends FoodInput {
  changeNote?: string | null;
}

function toFormValues(food?: FoodItem | null): FoodFormValues {
  if (!food) {
    return {
      name: "",
      category: FOOD_CATEGORIES[0],
      state: "RAW",
      kcalPer100g: 0,
      proteinPer100g: 0,
      fatPer100g: 0,
      carbPer100g: 0,
      sodiumMgPer100g: null,
      householdUnitName: "",
      householdUnitGrams: null,
      source: "MANUAL",
      sourceDetail: "",
      suitableBreakfast: false,
      suitableMainMeal: true,
      cookedYieldFactor: null,
      vegetableGroup: null,
      changeNote: "",
    };
  }
  return {
    name: food.name,
    category: food.category as FoodInput["category"],
    state: food.state,
    kcalPer100g: food.kcalPer100g,
    proteinPer100g: food.proteinPer100g,
    fatPer100g: food.fatPer100g,
    carbPer100g: food.carbPer100g,
    sodiumMgPer100g: food.sodiumMgPer100g,
    householdUnitName: food.householdUnitName ?? "",
    householdUnitGrams: food.householdUnitGrams,
    source: food.source,
    sourceDetail: food.sourceDetail ?? "",
    suitableBreakfast: food.suitableBreakfast,
    suitableMainMeal: food.suitableMainMeal,
    cookedYieldFactor: food.cookedYieldFactor,
    vegetableGroup: food.vegetableGroup as FoodFormValues["vegetableGroup"],
    changeNote: "",
  };
}

export function FoodForm({
  food,
  onSubmit,
  onCancel,
  submitting,
  requireChangeNote,
}: {
  food?: FoodItem | null;
  onSubmit: (values: FoodFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
  requireChangeNote?: boolean;
}) {
  const [values, setValues] = useState<FoodFormValues>(() => toFormValues(food));
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FoodFormValues>(key: K, value: FoodFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (values.name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if ([values.kcalPer100g, values.proteinPer100g, values.fatPer100g, values.carbPer100g].some((n) => n < 0)) {
      setError("Los macros no pueden ser negativos.");
      return;
    }
    if (requireChangeNote && !values.changeNote?.trim()) {
      setError("Contá brevemente por qué editás este alimento (queda en el historial).");
      return;
    }

    onSubmit({
      ...values,
      householdUnitName: values.householdUnitName?.trim() || null,
      householdUnitGrams: values.householdUnitGrams || null,
      sodiumMgPer100g: values.sodiumMgPer100g ?? null,
      sourceDetail: values.sourceDetail?.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {food ? `Editar: ${food.name}` : "Nuevo alimento"}
      </h3>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">Nombre</span>
        <input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Categoría</span>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value as FoodInput["category"])}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {FOOD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Estado</span>
          <select
            value={values.state}
            onChange={(e) => update("state", e.target.value as FoodInput["state"])}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(STATE_LABELS) as (keyof typeof STATE_LABELS)[]).map((k) => (
              <option key={k} value={k}>
                {STATE_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
        <span className="text-sm text-zinc-700 dark:text-zinc-300">¿Dónde tiene sentido usarlo en un plan?</span>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={values.suitableBreakfast}
            onChange={(e) => update("suitableBreakfast", e.target.checked)}
          />
          Desayuno / merienda (pan, huevo, yogur, fruta, queso, nueces...)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={values.suitableMainMeal}
            onChange={(e) => update("suitableMainMeal", e.target.checked)}
          />
          Almuerzo / cena (carnes, arroz, legumbres, verduras...)
        </label>
      </div>

      {values.state === "RAW" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">
            Factor de rendimiento cocido (opcional): cuánto pesa cocido por cada gramo crudo
          </span>
          <input
            type="number"
            step="0.1"
            placeholder="ej: 3 para arroz, 2.5 para fideos, 0.7 para carnes"
            value={values.cookedYieldFactor ?? ""}
            onChange={(e) => update("cookedYieldFactor", e.target.value === "" ? null : Number(e.target.value))}
            className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      )}

      {values.category === "Verduras" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">
            Grupo de verdura (opcional): A = uso libre, B = con moderación (más carbohidrato)
          </span>
          <select
            value={values.vegetableGroup ?? ""}
            onChange={(e) => update("vegetableGroup", e.target.value === "" ? null : (e.target.value as "A" | "B"))}
            className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">Sin clasificar</option>
            <option value="A">Grupo A (libre)</option>
            <option value="B">Grupo B (con moderación)</option>
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Kcal /100g</span>
          <input
            type="number"
            step="0.1"
            value={values.kcalPer100g}
            onChange={(e) => update("kcalPer100g", Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Proteína /100g</span>
          <input
            type="number"
            step="0.1"
            value={values.proteinPer100g}
            onChange={(e) => update("proteinPer100g", Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Grasa /100g</span>
          <input
            type="number"
            step="0.1"
            value={values.fatPer100g}
            onChange={(e) => update("fatPer100g", Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Carbohidrato /100g</span>
          <input
            type="number"
            step="0.1"
            value={values.carbPer100g}
            onChange={(e) => update("carbPer100g", Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">Sodio mg /100g (opcional)</span>
        <input
          type="number"
          step="1"
          value={values.sodiumMgPer100g ?? ""}
          onChange={(e) => update("sodiumMgPer100g", e.target.value === "" ? null : Number(e.target.value))}
          className="w-full max-w-[200px] rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Unidad casera (opcional)</span>
          <input
            placeholder="ej: 1 taza"
            value={values.householdUnitName ?? ""}
            onChange={(e) => update("householdUnitName", e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Equivalencia en gramos</span>
          <input
            type="number"
            step="1"
            value={values.householdUnitGrams ?? ""}
            onChange={(e) => update("householdUnitGrams", e.target.value === "" ? null : Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Fuente</span>
          <select
            value={values.source}
            onChange={(e) => update("source", e.target.value as FoodInput["source"])}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(SOURCE_LABELS) as (keyof typeof SOURCE_LABELS)[]).map((k) => (
              <option key={k} value={k}>
                {SOURCE_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Detalle de la fuente (opcional)</span>
          <input
            value={values.sourceDetail ?? ""}
            onChange={(e) => update("sourceDetail", e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">
          Motivo del cambio {requireChangeNote ? "" : "(opcional)"}
        </span>
        <input
          placeholder="ej: corregido según nueva edición de la tabla"
          value={values.changeNote ?? ""}
          onChange={(e) => update("changeNote", e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Guardando…" : food ? "Guardar cambios" : "Crear alimento"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
