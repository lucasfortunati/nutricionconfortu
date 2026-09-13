"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { FoodItem, Profile, ProfileFoodPreference } from "@prisma/client";
import { FOOD_CATEGORIES } from "@/lib/foods/categories";

const EXCLUSION_REASONS = ["Alergia", "Intolerancia", "No me gusta", "Otro"] as const;

type ViewFilter = "ALL" | "FAVORITE" | "EXCLUDED";

export default function ProfileFoodsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: profileId } = use(params);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [preferences, setPreferences] = useState<ProfileFoodPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("ALL");
  const [search, setSearch] = useState("");
  const [reasonPickerFoodId, setReasonPickerFoodId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [profileRes, foodsRes, preferencesRes] = await Promise.all([
      fetch(`/api/profiles/${profileId}`),
      fetch("/api/foods"),
      fetch(`/api/profiles/${profileId}/preferences`),
    ]);
    setProfile(await profileRes.json());
    setFoods(await foodsRes.json());
    setPreferences(await preferencesRes.json());
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    // Carga inicial de perfil, alimentos y preferencias; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const preferenceByFoodId = useMemo(() => {
    const map = new Map<string, ProfileFoodPreference>();
    for (const p of preferences) map.set(p.foodItemId, p);
    return map;
  }, [preferences]);

  const visibleFoods = foods.filter((food) => {
    if (categoryFilter && food.category !== categoryFilter) return false;
    if (search && !food.name.toLowerCase().includes(search.toLowerCase())) return false;
    const pref = preferenceByFoodId.get(food.id);
    if (viewFilter === "FAVORITE" && pref?.status !== "FAVORITE") return false;
    if (viewFilter === "EXCLUDED" && pref?.status !== "EXCLUDED") return false;
    return true;
  });

  const favoriteCount = preferences.filter((p) => p.status === "FAVORITE").length;
  const excludedCount = preferences.filter((p) => p.status === "EXCLUDED").length;

  async function setPreference(foodItemId: string, status: "FAVORITE" | "EXCLUDED", reason?: string) {
    const res = await fetch(`/api/profiles/${profileId}/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodItemId, status, reason: reason ?? null }),
    });
    const saved = await res.json();
    setPreferences((prev) => [...prev.filter((p) => p.foodItemId !== foodItemId), saved]);
  }

  async function clearPreference(foodItemId: string) {
    await fetch(`/api/profiles/${profileId}/preferences?foodItemId=${foodItemId}`, { method: "DELETE" });
    setPreferences((prev) => prev.filter((p) => p.foodItemId !== foodItemId));
  }

  function handleFavoriteClick(food: FoodItem) {
    const pref = preferenceByFoodId.get(food.id);
    if (pref?.status === "FAVORITE") {
      clearPreference(food.id);
    } else {
      setReasonPickerFoodId(null);
      setPreference(food.id, "FAVORITE");
    }
  }

  function handleExcludeClick(food: FoodItem) {
    const pref = preferenceByFoodId.get(food.id);
    if (pref?.status === "EXCLUDED") {
      clearPreference(food.id);
      setReasonPickerFoodId(null);
    } else {
      setReasonPickerFoodId(food.id);
    }
  }

  function confirmExclude(food: FoodItem, reason: string) {
    setPreference(food.id, "EXCLUDED", reason);
    setReasonPickerFoodId(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/perfiles" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← Cambiar de perfil
        </Link>
        <Link href={`/perfiles/${profileId}/plan`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          Mis planes →
        </Link>
      </div>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Alimentos {profile ? `de ${profile.name}` : ""}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Marcá tus alimentos favoritos y excluí los que no querés que aparezcan en tu plan (alergias,
          intolerancias o simplemente porque no te gustan).
        </p>
        {!loading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {favoriteCount} favoritos · {excludedCount} excluidos
          </p>
        )}
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
          <span className="text-zinc-700 dark:text-zinc-300">Ver</span>
          <select
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value as ViewFilter)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="ALL">Todos</option>
            <option value="FAVORITE">Solo favoritos</option>
            <option value="EXCLUDED">Solo excluidos</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-zinc-700 dark:text-zinc-300">Buscar</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ej: pollo"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleFoods.map((food) => {
            const pref = preferenceByFoodId.get(food.id);
            return (
              <li
                key={food.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {food.name}
                      {food.status === "NEEDS_REVIEW" && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Desactualizado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {food.category} · {food.kcalPer100g} kcal · P{food.proteinPer100g}/G{food.fatPer100g}/C
                      {food.carbPer100g} por 100g
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFavoriteClick(food)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        pref?.status === "FAVORITE"
                          ? "border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      ★ Favorito
                    </button>
                    <button
                      onClick={() => handleExcludeClick(food)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        pref?.status === "EXCLUDED"
                          ? "border-red-400 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                          : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {pref?.status === "EXCLUDED" && pref.reason && (
                  <p className="text-xs text-red-700 dark:text-red-400">Motivo: {pref.reason}</p>
                )}

                {reasonPickerFoodId === food.id && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">¿Por qué lo excluís?</span>
                    {EXCLUSION_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => confirmExclude(food, reason)}
                        className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {visibleFoods.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay alimentos que coincidan.</p>
          )}
        </ul>
      )}
    </div>
  );
}
