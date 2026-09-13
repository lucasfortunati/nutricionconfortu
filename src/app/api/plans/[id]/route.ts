import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plan/service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado." }, { status: 404 });
  }
  return NextResponse.json(plan);
}
