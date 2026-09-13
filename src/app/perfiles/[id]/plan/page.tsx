"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Plan } from "@prisma/client";

export default function PlanesListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/profiles/${profileId}/plans`);
    setPlans(await res.json());
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    // Carga inicial de planes; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <Link href={`/perfiles/${profileId}/alimentos`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← Volver a alimentos
      </Link>

      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Planes alimentarios</h1>
        <Link
          href={`/perfiles/${profileId}/plan/nuevo`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          + Nuevo plan
        </Link>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      ) : plans.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Todavía no generaste ningún plan.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/perfiles/${profileId}/plan/${plan.id}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {plan.label ?? new Date(plan.createdAt).toLocaleDateString("es-AR")}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {Math.round(plan.targetKcal)} kcal · {plan.mealsCount} comidas
                  </p>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">Ver →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
