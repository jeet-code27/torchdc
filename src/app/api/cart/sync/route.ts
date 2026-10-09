import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET /api/cart/sync?sessionId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await auth();
    const userId = session?.user?.id;

    // Look for active cart by userId first if authenticated, else by sessionId
    let cart = null;
    if (userId) {
      cart = await Cart.findOne({
        userId,
        status: "active",
      }).lean();
    }

    if (!cart) {
      cart = await Cart.findOne({
        sessionId,
        status: "active",
      }).lean();
    }

    return NextResponse.json({
      success: true,
      cart: cart || null,
    });
  } catch (error) {
    console.error("Error fetching cart from DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart/sync
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      items,
      fulfillment,
      deliveryZip,
      subtotal,
      totalCount,
      customerInfo,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await auth();
    const userId = session?.user?.id;

    // Filter and sanitize items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedItems = (items || []).map((it: any) => ({
      productId: String(it.id || it.productId),
      name: String(it.name || ""),
      slug: String(it.slug || ""),
      price: Number(it.price || 0),
      image: String(it.image || ""),
      weight: String(it.weight || ""),
      tier: String(it.tier || ""),
      category: String(it.category || ""),
      quantity: Math.max(1, Number(it.quantity || 1)),
    }));

    const computedSubtotal = sanitizedItems.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, it: any) => sum + it.price * it.quantity,
      0
    );
    const computedTotalCount = sanitizedItems.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum: number, it: any) => sum + it.quantity,
      0
    );

    // Find existing active cart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = userId
      ? { $or: [{ userId }, { sessionId }], status: "active" }
      : { sessionId, status: "active" };

    const updateData: Record<string, unknown> = {
      sessionId,
      items: sanitizedItems,
      fulfillment: fulfillment === "pickup" ? "pickup" : "delivery",
      deliveryZip: deliveryZip || "20004",
      subtotal: computedSubtotal,
      totalCount: computedTotalCount,
      lastActiveAt: new Date(),
      status: "active",
    };

    if (userId) {
      updateData.userId = userId;
    }

    if (customerInfo && typeof customerInfo === "object") {
      updateData.customerInfo = customerInfo;
    }

    const updatedCart = await Cart.findOneAndUpdate(query, updateData, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    return NextResponse.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error syncing cart to DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/sync?sessionId=xxx
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      await Cart.updateMany(
        { userId, status: "active" },
        { items: [], subtotal: 0, totalCount: 0, lastActiveAt: new Date() }
      );
    }

    await Cart.updateMany(
      { sessionId, status: "active" },
      { items: [], subtotal: 0, totalCount: 0, lastActiveAt: new Date() }
    );

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart in DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
