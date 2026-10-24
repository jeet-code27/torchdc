import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { canEditOrders } from "@/lib/orders/access";
import { moveOrdersToStatus, StatusMoveError, type OrderStatus } from "@/lib/orders/order-status";

export const dynamic = "force-dynamic";

const TARGETS: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "completed", "cancelled"];

// POST /api/admin/orders/status - One-tap / batch status change { orderIds: string[], status }
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!canEditOrders(user)) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing orders edit permission" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.orderIds) ? body.orderIds.map(String) : [];
    const status = body.status as OrderStatus;

    if (!ids.length || ids.length > 100 || !ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ success: false, error: "orderIds must be 1-100 order ids" }, { status: 400 });
    }
    if (!TARGETS.includes(status)) {
      return NextResponse.json({ success: false, error: "Unknown status" }, { status: 400 });
    }

    await connectToDatabase();
    const orders = await moveOrdersToStatus(Array.from(new Set(ids)), status, user);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    if (error instanceof StatusMoveError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 });
    }
    console.error("POST /api/admin/orders/status error:", error);
    return NextResponse.json({ success: false, error: "Failed to update orders" }, { status: 500 });
  }
}
