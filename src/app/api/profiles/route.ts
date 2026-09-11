import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createProfile, listProfiles } from "@/lib/profiles/service";
import { profileInputSchema } from "@/lib/profiles/schema";

export async function GET() {
  const profiles = await listProfiles();
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = profileInputSchema.parse(body);
    const profile = await createProfile(input);
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear el perfil." }, { status: 500 });
  }
}
