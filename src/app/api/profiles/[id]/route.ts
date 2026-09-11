import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/profiles/service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado." }, { status: 404 });
  }
  return NextResponse.json(profile);
}
