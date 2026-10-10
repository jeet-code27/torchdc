import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const rawCode = (body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal) || 0;

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: "Please enter a coupon code" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code: rawCode }).lean();

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${rawCode}" is invalid.` },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: `Coupon "${rawCode}" is no longer active.` },
        { status: 400 }
      );
    }

    const now = new Date();

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json(
        { success: false, error: `Coupon "${rawCode}" has not started yet.` },
        { status: 400 }
      );
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json(
        { success: false, error: `Coupon "${rawCode}" has expired.` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: `Coupon "${rawCode}" has reached its maximum usage limit.` },
        { status: 400 }
      );
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required for coupon "${rawCode}".`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "fixed_amount") {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === "free_delivery") {
      discountAmount = 0; // Delivery is already free across DC metro
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
