import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { listPreferences, removePreference, upsertPreference } from "@/lib/preferences/service";
import { upsertPreferenceSchema } from "@/lib/preferences/schema";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preferences = await listPreferences(id);
  return NextResponse.json(preferences);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const input = upsertPreferenceSchema.parse(body);
    const preference = await upsertPreference(id, input);
    return NextResponse.json(preference);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo guardar la preferencia." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const foodItemId = req.nextUrl.searchParams.get("foodItemId");
  if (!foodItemId) {
    return NextResponse.json({ error: "Falta foodItemId." }, { status: 400 });
  }
  await removePreference(id, foodItemId);
  return NextResponse.json({ ok: true });
}
