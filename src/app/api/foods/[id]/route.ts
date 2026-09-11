import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getFoodItem, updateFoodItem } from "@/lib/foods/service";
import { foodUpdateSchema } from "@/lib/foods/schema";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const food = await getFoodItem(id);
  if (!food) {
    return NextResponse.json({ error: "Alimento no encontrado." }, { status: 404 });
  }
  return NextResponse.json(food);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const input = foodUpdateSchema.parse(body);
    const result = await updateFoodItem(id, input);
    return NextResponse.json(result.food);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo actualizar el alimento." }, { status: 500 });
  }
}
