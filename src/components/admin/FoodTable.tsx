"use client";

import Link from "next/link";
import type { FoodItem } from "@prisma/client";

const STATE_LABELS = { RAW: "Crudo", COOKED: "Cocido", NA: "—" } as const;
const SOURCE_LABELS = { SARA2: "SARA 2", ANMAT: "ANMAT", MANUAL: "Manual" } as const;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function FoodTable({
  foods,
  onEdit,
  onToggleStatus,
}: {
  foods: FoodItem[];
  onEdit: (food: FoodItem) => void;
  onToggleStatus: (food: FoodItem) => void;
}) {
  if (foods.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay alimentos que coincidan con el filtro.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium">Nombre</th>
            <th className="px-3 py-2 font-medium">Categoría</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 text-right font-medium">Kcal</th>
            <th className="px-3 py-2 text-right font-medium">P/G/C (g)</th>
            <th className="px-3 py-2 font-medium">Fuente</th>
            <th className="px-3 py-2 font-medium">Actualizado</th>
            <th className="px-3 py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-50">
                {food.name}
                {food.status === "NEEDS_REVIEW" && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Desactualizado
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{food.category}</td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{STATE_LABELS[food.state]}</td>
              <td className="px-3 py-2 text-right tabular-nums text-zinc-900 dark:text-zinc-50">
                {food.kcalPer100g}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                {food.proteinPer100g}/{food.fatPer100g}/{food.carbPer100g}
              </td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{SOURCE_LABELS[food.source]}</td>
              <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{formatDate(food.updatedAt)}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onEdit(food)} className="text-blue-600 hover:underline dark:text-blue-400">
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleStatus(food)}
                    className="text-amber-700 hover:underline dark:text-amber-400"
                  >
                    {food.status === "NEEDS_REVIEW" ? "Marcar activo" : "Marcar desactualizado"}
                  </button>
                  <Link href={`/admin/alimentos/${food.id}/historial`} className="text-zinc-600 hover:underline dark:text-zinc-400">
                    Historial
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
