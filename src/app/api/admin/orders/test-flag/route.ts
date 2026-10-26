import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { canEditOrders } from "@/lib/orders/access";
import { Order } from "@/models/Order";
import { ActivityLog } from "@/models/ActivityLog";

export const dynamic = "force-dynamic";

// POST /api/admin/orders/test-flag - { orderIds: string[], isTest: boolean }
// Test orders are left out of the Orders list, the dashboard and every total. Nothing is deleted.
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!canEditOrders(user)) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing orders edit permission" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body.orderIds) ? body.orderIds.map(String) : [];
    if (!ids.length || ids.length > 100 || !ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return NextResponse.json({ success: false, error: "orderIds must be 1-100 order ids" }, { status: 400 });
    }
    if (typeof body.isTest !== "boolean") {
      return NextResponse.json({ success: false, error: "isTest (true/false) is required" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await Order.updateMany({ _id: { $in: ids } }, { $set: { isTest: body.isTest } });
    try {
      await ActivityLog.create({
        action: "order.test_flag",
        description: `${body.isTest ? "Marked" : "Unmarked"} ${result.modifiedCount} order(s) as test`,
        actor: { userId: user.userId, name: user.name || "Admin", email: user.email || "unknown", role: user.role || "admin" },
        entityType: "order",
        metadata: { orderIds: ids, isTest: body.isTest },
      });
    } catch (err) {
      console.error("[orders] activity log failed", err);
    }
    return NextResponse.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    console.error("POST /api/admin/orders/test-flag error:", error);
    return NextResponse.json({ success: false, error: "Failed to update orders" }, { status: 500 });
  }
}
