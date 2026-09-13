import { NextRequest, NextResponse } from "next/server";
import { regenerateMeal } from "@/lib/plan/service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; mealId: string }> }) {
  const { mealId } = await params;
  try {
    const outcome = await regenerateMeal(mealId);
    return NextResponse.json(outcome);
  } catch {
    return NextResponse.json({ error: "No se pudo regenerar la comida." }, { status: 500 });
  }
}
