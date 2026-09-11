import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { createFoodItem, listFoodItems } from "@/lib/foods/service";
import { foodInputSchema } from "@/lib/foods/schema";
import type { FoodStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const status = (req.nextUrl.searchParams.get("status") as FoodStatus | null) ?? undefined;

  const foods = await listFoodItems({ category, status: status ?? undefined });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = foodInputSchema.parse(body);
    const food = await createFoodItem(input, body.changeNote ?? "Alta manual desde el panel de administración.");
    return NextResponse.json(food, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "No se pudo crear el alimento." }, { status: 500 });
  }
}
