import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { setFoodStatus } from "@/lib/foods/service";
import { markReviewSchema } from "@/lib/foods/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = markReviewSchema.parse(body);
    const result = await setFoodStatus(id, status, body.changeNote ?? null);
    return NextResponse.json(result.food);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo actualizar el estado." }, { status: 500 });
  }
}
