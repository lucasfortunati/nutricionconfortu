import { NextRequest, NextResponse } from "next/server";
import { getEquivalentOptionsForItem } from "@/lib/plan/service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  try {
    const options = await getEquivalentOptionsForItem(itemId);
    return NextResponse.json(options);
  } catch {
    return NextResponse.json({ error: "No se pudieron calcular las opciones equivalentes." }, { status: 500 });
  }
}
