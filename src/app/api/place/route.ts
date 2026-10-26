import { NextRequest, NextResponse } from "next/server";
import { geoapifyEnabled, locateAddress } from "@/lib/geoapify";

export const dynamic = "force-dynamic";

// GET /api/place?text=<picked address> - full address and delivery fee for a picked suggestion
export async function GET(req: NextRequest) {
  if (!geoapifyEnabled()) return NextResponse.json({ disabled: true }, { status: 503 });
  try {
    const p = await locateAddress(req.nextUrl.searchParams.get("text") || "");
    if (!p) return NextResponse.json({ error: "Unknown address" }, { status: 400 });
    return NextResponse.json(
      { address: p.address, state: p.state, quote: p.quote },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("place failed:", String((e as Error).message || e).slice(0, 160));
    return NextResponse.json({ error: "Address lookup failed" }, { status: 502 });
  }
}
