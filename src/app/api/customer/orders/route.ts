import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/customer/orders - Fetch orders belonging to the logged-in customer
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "customer") {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    await connectToDatabase();

    const userEmail = session.user.email?.toLowerCase().trim();
    const userPhone = session.user.phone?.trim();
    const userObjectId = mongoose.Types.ObjectId.isValid(session.user.id)
      ? new mongoose.Types.ObjectId(session.user.id)
      : null;

    // Search by userId, or matching email, or matching phone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orConditions: any[] = [];
    if (userObjectId) orConditions.push({ userId: userObjectId });
    if (userEmail) orConditions.push({ "customer.email": userEmail });
    if (userPhone) {
      const cleanDigits = userPhone.replace(/\D/g, "");
      orConditions.push({ "customer.phone": userPhone });
      if (cleanDigits.length >= 7) {
        orConditions.push({ "customer.phone": new RegExp(cleanDigits.slice(-10)) });
      }
    }

    const orders = await Order.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders" },
      { status: 500 }
    );
  }
}
