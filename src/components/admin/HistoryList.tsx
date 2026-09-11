"use client";

import type { FoodItemVersion } from "@prisma/client";

const REASON_LABELS = {
  CREATE: "Alta",
  EDIT: "Edición",
  MARK_REVIEW: "Cambio de estado",
  RESTORE: "Restauración",
} as const;

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  category: "Categoría",
  state: "Estado (crudo/cocido)",
  kcalPer100g: "Kcal/100g",
  proteinPer100g: "Proteína/100g",
  fatPer100g: "Grasa/100g",
  carbPer100g: "Carbohidrato/100g",
  sodiumMgPer100g: "Sodio mg/100g",
  householdUnitName: "Unidad casera",
  householdUnitGrams: "Gramos de la unidad casera",
  source: "Fuente",
  sourceDetail: "Detalle de la fuente",
  status: "Estado de vigencia",
};

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryList({
  versions,
  onRestore,
  restoringId,
}: {
  versions: FoodItemVersion[];
  onRestore: (versionId: string) => void;
  restoringId?: string | null;
}) {
  const latestVersionNumber = versions[0]?.versionNumber;

  return (
    <ol className="flex flex-col gap-4">
      {versions.map((version, index) => {
        const previous = versions[index + 1];
        const changedFields: string[] = version.changedFields ? JSON.parse(version.changedFields) : [];

        return (
          <li key={version.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  v{version.versionNumber}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {REASON_LABELS[version.reason]}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(version.createdAt)}</span>
              </div>
              {version.versionNumber !== latestVersionNumber && (
                <button
                  onClick={() => onRestore(version.id)}
                  disabled={restoringId === version.id}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                >
                  {restoringId === version.id ? "Restaurando…" : "Restaurar esta versión"}
                </button>
              )}
            </div>

            {version.changeNote && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">“{version.changeNote}”</p>
            )}

            {changedFields.length > 0 && previous ? (
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {changedFields.map((field) => (
                  <li key={field} className="text-zinc-700 dark:text-zinc-300">
                    <span className="font-medium">{FIELD_LABELS[field] ?? field}:</span>{" "}
                    <span className="text-zinc-500 line-through dark:text-zinc-500">
                      {String((previous as unknown as Record<string, unknown>)[field] ?? "—")}
                    </span>{" "}
                    → <span>{String((version as unknown as Record<string, unknown>)[field] ?? "—")}</span>
                  </li>
                ))}
              </ul>
            ) : (
              version.reason === "CREATE" && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {version.kcalPer100g} kcal · P{version.proteinPer100g}/G{version.fatPer100g}/C{version.carbPer100g} por
                  100g
                </p>
              )
            )}
          </li>
        );
      })}
    </ol>
  );
}
