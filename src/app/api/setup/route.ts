import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INIT_SCHEMA_STATEMENTS } from "@/lib/db/schemaSql";
import { seedFoods } from "@/lib/foods/seedData";

// Corre en runtime (no en build), donde las variables de entorno "sensibles"
// de la base de datos sí están disponibles. Ver schemaSql.ts para el porqué.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAlreadyExistsError(err: unknown): boolean {
  return err instanceof Error && /already exists/i.test(err.message);
}

export async function GET() {
  const log: string[] = [];

  try {
    for (const statement of INIT_SCHEMA_STATEMENTS) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (err) {
        if (isAlreadyExistsError(err)) {
          continue;
        }
        throw err;
      }
    }
    log.push("Estructura de la base de datos: lista.");

    const { created, skipped } = await seedFoods();
    log.push(`Alimentos cargados: ${created.length} nuevos, ${skipped.length} ya existían.`);

    return NextResponse.json({ ok: true, log }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, log, error: err instanceof Error ? err.message : "Error desconocido." },
      { status: 500 },
    );
  }
}
