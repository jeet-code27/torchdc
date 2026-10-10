import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brand } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("brands.view");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const perm = await requirePermission("brands.edit");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const brand = await Brand.findById(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    if (body.name !== undefined) brand.name = body.name.trim();
    if (body.slug !== undefined) {
      brand.slug = body.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (body.logoUrl !== undefined) brand.logoUrl = body.logoUrl;
    if (body.description !== undefined) brand.description = body.description;
    if (body.website !== undefined) brand.website = body.website;
    if (body.isActive !== undefined) brand.isActive = Boolean(body.isActive);
    if (body.featured !== undefined) brand.featured = Boolean(body.featured);
    if (body.displayOrder !== undefined) brand.displayOrder = Number(body.displayOrder) || 0;

    await brand.save();
    return NextResponse.json({ success: true, brand });
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
    const perm = await requirePermission("brands.delete");
    if (!perm.authorized) return perm.response;

    const { id } = await params;
    await connectDB();
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
