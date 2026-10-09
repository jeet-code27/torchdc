import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/carts/abandoned
// Retrieves all abandoned carts (untouched for > 30 minutes with items and no order)
export async function GET() {
  try {
    const session = await auth();
    // Verify admin access
    const roleKey = (session?.user as { roleKey?: string })?.roleKey;
    if (!session || (roleKey !== "SUPER_ADMIN" && roleKey !== "ADMIN" && roleKey !== "STORE_MANAGER")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
