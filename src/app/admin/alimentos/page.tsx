"use client";

import { useCallback, useEffect, useState } from "react";
import type { FoodItem, FoodStatus } from "@prisma/client";
import { FOOD_CATEGORIES } from "@/lib/foods/categories";
import { FoodTable } from "@/components/admin/FoodTable";
import { FoodForm, type FoodFormValues } from "@/components/admin/FoodForm";

export default function AdminAlimentosPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<FoodStatus | "">("");
  const [editing, setEditing] = useState<FoodItem | null | "new">(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/foods?${params.toString()}`);
    const data = await res.json();
    setFoods(data);
    setLoading(false);
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    // Carga inicial y recarga al cambiar los filtros; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSubmit(values: FoodFormValues) {
    setSubmitting(true);
    try {
      if (editing && editing !== "new") {
        const res = await fetch(`/api/foods/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("update failed");
      } else {
        const res = await fetch("/api/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("create failed");
      }
      setEditing(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(food: FoodItem) {
    const nextStatus: FoodStatus = food.status === "NEEDS_REVIEW" ? "ACTIVE" : "NEEDS_REVIEW";
    await fetch(`/api/foods/${food.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    await load();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Administración de alimentos</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Editá los macros, agregá alimentos nuevos y marcá los que necesitan revisión. Cada cambio queda registrado
          en el historial de versiones del alimento.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Categoría</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">Todas</option>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FoodStatus | "")}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="NEEDS_REVIEW">Desactualizados</option>
          </select>
        </label>

        <button
          onClick={() => setEditing("new")}
          className="ml-auto rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Nuevo alimento
        </button>
      </div>

      {editing && (
        <FoodForm
          food={editing === "new" ? null : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          submitting={submitting}
          requireChangeNote={editing !== "new"}
        />
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      ) : (
        <FoodTable foods={foods} onEdit={setEditing} onToggleStatus={handleToggleStatus} />
      )}
    </div>
  );
}
