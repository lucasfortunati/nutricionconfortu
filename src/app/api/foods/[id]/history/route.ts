import { NextRequest, NextResponse } from "next/server";
import { getFoodItemHistory } from "@/lib/foods/service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const history = await getFoodItemHistory(id);
  return NextResponse.json(history);
}
