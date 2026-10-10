import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Coupon } from "@/models/Coupon";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("deals.view");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const coupon = await Coupon.findById(id).lean();
    if (!coupon) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load coupon" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("deals.manage");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (body.code) updateData.code = body.code.trim().toUpperCase();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.discountType) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = Number(body.discountValue);
    if (body.minOrderAmount !== undefined) updateData.minOrderAmount = Number(body.minOrderAmount);
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount ? Number(body.maxDiscount) : undefined;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit ? Number(body.usageLimit) : undefined;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const coupon = await Coupon.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!coupon) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("deals.manage");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
