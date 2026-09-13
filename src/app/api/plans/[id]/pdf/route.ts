import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getPlan } from "@/lib/plan/service";
import { PlanDocument } from "@/lib/pdf/PlanDocument";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado." }, { status: 404 });
  }

  const buffer = await renderToBuffer(PlanDocument({ plan }));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="plan-${plan.id}.pdf"`,
    },
  });
}
