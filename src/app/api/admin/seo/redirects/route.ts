import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Redirect } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermission("seo.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { sourceUrl: { $regex: search, $options: "i" } },
        { targetUrl: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const redirects = await Redirect.find(query).sort({ createdAt: -1 }).lean();

    const stats = {
      totalRedirects: redirects.length,
      activeRedirects: redirects.filter((r) => r.isActive).length,
      totalHits: redirects.reduce((sum, r) => sum + (r.hits || 0), 0),
    };

    return NextResponse.json({
      success: true,
      redirects: redirects.map((r) => ({ ...r, _id: r._id.toString() })),
      stats,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/seo/redirects error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const perm = await requirePermission("seo.manage");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const body = await req.json();
    const { sourceUrl, targetUrl, statusCode, notes } = body;

    if (!sourceUrl || !targetUrl) {
      return NextResponse.json(
        { success: false, error: "Both source URL and target URL are required" },
        { status: 400 }
      );
    }

    // Normalize source URL to start with / and lowercase
    let cleanSource = sourceUrl.trim().toLowerCase();
    if (!cleanSource.startsWith("http") && !cleanSource.startsWith("/")) {
      cleanSource = `/${cleanSource}`;
    }

    const existing = await Redirect.findOne({ sourceUrl: cleanSource });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A redirect for "${cleanSource}" already exists` },
        { status: 409 }
      );
    }

    const redirect = await Redirect.create({
      sourceUrl: cleanSource,
      targetUrl: targetUrl.trim(),
      statusCode: statusCode === 302 ? 302 : 301,
      isActive: true,
      notes: notes || "",
    });

    return NextResponse.json({ success: true, redirect }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/seo/redirects error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
