import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getCurrentUser } from "@/lib/permissions";

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
