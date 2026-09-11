import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { restoreFoodVersion } from "@/lib/foods/service";
import { restoreVersionSchema } from "@/lib/foods/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { versionId } = restoreVersionSchema.parse(body);
    const food = await restoreFoodVersion(id, versionId, body.changeNote ?? null);
    return NextResponse.json(food);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "No se pudo restaurar la versión.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
