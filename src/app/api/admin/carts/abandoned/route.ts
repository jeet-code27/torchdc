import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getCurrentUser } from "@/lib/permissions";
import { canEditOrders } from "@/lib/orders/access";
import { ActivityLog } from "@/models/ActivityLog";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/admin/carts/abandoned
// Retrieves all abandoned carts (untouched for > 30 minutes with items and no order)
export async function GET() {
  try {
    // Same access rule as the orders list (abandoned carts are shown on the Orders page)
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const hasAccess =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "store_manager" ||
      user.permissions.includes("*") ||
      user.permissions.includes("orders.view") ||
      user.permissions.includes("orders.manage");
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing orders permission" }, { status: 403 });
    }

    await connectToDatabase();

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // 1. Mark untouched active carts as abandoned
    await Cart.updateMany(
      {
        status: "active",
        items: { $exists: true, $ne: [] },
        lastActiveAt: { $lt: thirtyMinutesAgo },
      },
      {
        $set: { status: "abandoned" },
      }
    );

    // 2. Fetch all abandoned carts
    const abandonedCarts = await Cart.find({
      status: "abandoned",
      items: { $exists: true, $ne: [] },
    })
      .sort({ lastActiveAt: -1 })
      .populate("userId", "name email phone")
      .lean();

    const totalAbandonedValue = abandonedCarts.reduce(
      (sum, c) => sum + (c.subtotal || 0),
      0
    );

    return NextResponse.json({
      success: true,
      count: abandonedCarts.length,
      totalAbandonedValue,
      carts: abandonedCarts,
    });
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch abandoned carts" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/carts/abandoned - clear old abandoned carts
// Body: { ids: string[] } for chosen carts, { olderThanDays: number } for carts idle that long, or { all: true }.
// Only carts already marked abandoned are removed; live carts and converted ones are never touched.
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (!canEditOrders(user)) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing orders edit permission" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const filter: Record<string, unknown> = { status: "abandoned" };
    let what = "";
    if (Array.isArray(body.ids) && body.ids.length) {
      const ids = body.ids.map(String).filter((id: string) => mongoose.Types.ObjectId.isValid(id)).slice(0, 500);
      if (!ids.length) {
        return NextResponse.json({ success: false, error: "No valid cart ids" }, { status: 400 });
      }
      filter._id = { $in: ids };
      what = `${ids.length} selected`;
    } else if (Number(body.olderThanDays) > 0) {
      const days = Math.min(3650, Number(body.olderThanDays));
      filter.lastActiveAt = { $lt: new Date(Date.now() - days * 24 * 3_600_000) };
      what = `older than ${days} days`;
    } else if (body.all === true) {
      what = "all";
    } else {
      return NextResponse.json({ success: false, error: "Say which carts to delete" }, { status: 400 });
    }

    await connectToDatabase();
    const result = await Cart.deleteMany(filter);
    try {
      await ActivityLog.create({
        action: "carts.abandoned_delete",
        description: `Deleted ${result.deletedCount} abandoned cart(s) (${what})`,
        actor: { userId: user.userId, name: user.name || "Admin", email: user.email || "unknown", role: user.role || "admin" },
        entityType: "system",
      });
    } catch (err) {
      console.error("[carts] activity log failed", err);
    }
    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("Error deleting abandoned carts:", error);
    return NextResponse.json({ success: false, error: "Failed to delete abandoned carts" }, { status: 500 });
  }
}
