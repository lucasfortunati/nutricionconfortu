import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createPlan, listPlans } from "@/lib/plan/service";
import { createPlanSchema } from "@/lib/plan/schema";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plans = await listPlans(id);
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const input = createPlanSchema.parse(body);
    const outcome = await createPlan(id, input);
    return NextResponse.json(outcome, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo generar el plan." }, { status: 500 });
  }
}
