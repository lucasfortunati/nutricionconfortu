import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { swapMealItem } from "@/lib/plan/service";

const swapSchema = z.object({ foodItemId: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  try {
    const body = await req.json();
    const { foodItemId } = swapSchema.parse(body);
    const item = await swapMealItem(itemId, foodItemId);
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "No se pudo cambiar el alimento." }, { status: 500 });
  }
}
