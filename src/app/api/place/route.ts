import { NextRequest, NextResponse } from "next/server";
import { lookupPlace, placesEnabled } from "@/lib/google-places";

export const dynamic = "force-dynamic";

// GET /api/place?id=<placeId>&s=<session> - full address and delivery fee for a picked suggestion
export async function GET(req: NextRequest) {
  if (!placesEnabled()) return NextResponse.json({ disabled: true }, { status: 503 });
  try {
    const p = await lookupPlace(req.nextUrl.searchParams.get("id") || "", req.nextUrl.searchParams.get("s") || "");
    if (!p) return NextResponse.json({ error: "Unknown address" }, { status: 400 });
    return NextResponse.json(p, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("place failed:", String((e as Error).message || e).slice(0, 160));
    return NextResponse.json({ error: "Address lookup failed" }, { status: 502 });
  }
}
