import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Redirect } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("seo.manage");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const redirect = await Redirect.findById(id);
    if (!redirect) {
      return NextResponse.json({ success: false, error: "Redirect not found" }, { status: 404 });
    }

    if (body.sourceUrl !== undefined) {
      let clean = body.sourceUrl.trim().toLowerCase();
      if (!clean.startsWith("http") && !clean.startsWith("/")) clean = `/${clean}`;
      redirect.sourceUrl = clean;
    }
    if (body.targetUrl !== undefined) redirect.targetUrl = body.targetUrl.trim();
    if (body.statusCode !== undefined) redirect.statusCode = body.statusCode === 302 ? 302 : 301;
    if (body.isActive !== undefined) redirect.isActive = Boolean(body.isActive);
    if (body.notes !== undefined) redirect.notes = body.notes;

    await redirect.save();
    return NextResponse.json({ success: true, redirect });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("seo.manage");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const redirect = await Redirect.findByIdAndDelete(id);
    if (!redirect) {
      return NextResponse.json({ success: false, error: "Redirect not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Redirect deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
