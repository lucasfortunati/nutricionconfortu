"use client";

import { useState } from "react";
import type { Sex } from "@/lib/nutrition/bmr";
import {
  AGE_RANGE,
  HEIGHT_CM_RANGE,
  WEIGHT_KG_RANGE,
  isAgeValid,
  isHeightCmValid,
  isWeightKgValid,
} from "@/lib/validation/ranges";

export interface ProfileFormValues {
  name: string;
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
}

export function ProfileForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("FEMALE");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("165");
  const [weightKg, setWeightKg] = useState("65");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Ingresá un nombre de al menos 2 caracteres.");
      return;
    }
    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);

    if (!isAgeValid(ageNum)) {
      setError(`La edad debe estar entre ${AGE_RANGE.min} y ${AGE_RANGE.max} años.`);
      return;
    }
    if (!isHeightCmValid(heightNum)) {
      setError(`La altura debe estar entre ${HEIGHT_CM_RANGE.min} y ${HEIGHT_CM_RANGE.max} cm.`);
      return;
    }
    if (!isWeightKgValid(weightNum)) {
      setError(`El peso debe estar entre ${WEIGHT_KG_RANGE.min} y ${WEIGHT_KG_RANGE.max} kg.`);
      return;
    }

    onSubmit({ name: name.trim(), sex, ageYears: ageNum, heightCm: heightNum, weightKg: weightNum });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Nuevo perfil</h3>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-zinc-700 dark:text-zinc-300">Nombre</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej: Juana Pérez"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>

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
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Creando…" : "Crear perfil"}
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
