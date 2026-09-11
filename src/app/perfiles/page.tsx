"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";
import { ProfileForm, type ProfileFormValues } from "@/components/profiles/ProfileForm";
import { setSelectedProfileId } from "@/lib/profiles/storage";

const SEX_LABELS = { MALE: "Masculino", FEMALE: "Femenino" } as const;

export default function PerfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/profiles");
    setProfiles(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // Carga inicial de perfiles; no hay librería de fetching en este proyecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function selectProfile(id: string) {
    setSelectedProfileId(id);
    router.push(`/perfiles/${id}/alimentos`);
  }

  async function handleCreate(values: ProfileFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const profile = await res.json();
      setCreating(false);
      selectProfile(profile.id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Perfiles</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Elegí un perfil para gestionar sus alimentos favoritos y generar planes, o creá uno nuevo.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{profile.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {SEX_LABELS[profile.sex]} · {profile.ageYears} años · {profile.weightKg}kg · {profile.heightCm}cm
                </p>
              </div>
              <button
                onClick={() => selectProfile(profile.id)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Usar este perfil
              </button>
            </li>
          ))}
          {profiles.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Todavía no hay perfiles creados.</p>
          )}
        </ul>
      )}

      {creating ? (
        <ProfileForm onSubmit={handleCreate} onCancel={() => setCreating(false)} submitting={submitting} />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="self-start rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
        >
          + Nuevo perfil
        </button>
      )}
    </div>
  );
}
