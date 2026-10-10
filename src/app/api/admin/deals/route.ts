import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Coupon } from "@/models/Coupon";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const perm = await requirePermission("deals.view");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || "all";

    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const totalRedemptions = (await Coupon.find({}).select("usageCount").lean()).reduce(
      (sum, c) => sum + (c.usageCount || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
      },
      coupons,
    });
  } catch (error) {
    console.error("Failed to load deals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load deals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const perm = await requirePermission("deals.manage");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();
    const body = await req.json();

    const code = (body.code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const existing = await Coupon.findOne({ code }).lean();
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${code}" already exists.` },
        { status: 400 }
      );
    }

    const discountType = body.discountType || "percentage";
    const discountValue = Number(body.discountValue) || 0;

    if (discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: "Discount value must be greater than zero" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code,
      description: body.description?.trim(),
      discountType,
      discountValue,
      minOrderAmount: Number(body.minOrderAmount) || 0,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error: any) {
    console.error("Failed to create coupon:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create deal" },
      { status: 500 }
    );
  }
}
