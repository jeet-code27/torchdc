import { NextRequest, NextResponse } from "next/server";
import { geoapifyEnabled, suggestAddresses } from "@/lib/geoapify";

export const dynamic = "force-dynamic";

// GET /api/places?q=1425%20R - checkout address suggestions (DC, Maryland, Virginia)
export async function GET(req: NextRequest) {
  if (!geoapifyEnabled()) return NextResponse.json({ disabled: true, suggestions: [] }, { status: 503 });
  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  if (q.length < 3) return NextResponse.json({ suggestions: [] });
  try {
    const suggestions = await suggestAddresses(q);
    return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("places failed:", String((e as Error).message || e).slice(0, 160));
    return NextResponse.json({ suggestions: [] }, { status: 502 });
  }
}
