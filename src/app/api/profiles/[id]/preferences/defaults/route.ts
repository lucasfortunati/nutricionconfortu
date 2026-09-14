import { NextRequest, NextResponse } from "next/server";
import { applyDefaultFavorites } from "@/lib/preferences/service";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await applyDefaultFavorites(id);
  return NextResponse.json(result);
}
