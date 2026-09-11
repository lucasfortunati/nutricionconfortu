"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { FoodItem, FoodItemVersion } from "@prisma/client";
import { HistoryList } from "@/components/admin/HistoryList";

export default function FoodHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [food, setFood] = useState<FoodItem | null>(null);
  const [versions, setVersions] = useState<FoodItemVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [foodRes, historyRes] = await Promise.all([
      fetch(`/api/foods/${id}`),
      fetch(`/api/foods/${id}/history`),
    ]);
    setFood(await foodRes.json());
    setVersions(await historyRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    // Carga inicial del alimento y su historial; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      await fetch(`/api/foods/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      await load();
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href="/admin/alimentos" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Volver al panel de alimentos
      </Link>

      {loading || !food ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      ) : (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Historial de {food.name}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Versión actual: v{food.currentVersion} · {food.kcalPer100g} kcal · P{food.proteinPer100g}/G
              {food.fatPer100g}/C{food.carbPer100g} por 100g
            </p>
          </header>

          <HistoryList versions={versions} onRestore={handleRestore} restoringId={restoringId} />
        </>
      )}
    </div>
  );
}
