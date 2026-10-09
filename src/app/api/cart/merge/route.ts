import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart, ICartItem } from "@/models/Cart";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// POST /api/cart/merge
// Merges guest sessionId cart into logged in userId cart
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. User must be logged in to merge carts." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Find guest cart
    const guestCart = await Cart.findOne({
      sessionId,
      status: "active",
      $or: [{ userId: null }, { userId: { $exists: false } }],
    });

    // 2. Find existing user cart
    const userCart = await Cart.findOne({
      userId,
      status: "active",
    });

    if (!guestCart || guestCart.items.length === 0) {
      // Nothing to merge from guest; return existing user cart if any
      return NextResponse.json({
        success: true,
        cart: userCart || null,
        merged: false,
      });
    }

    if (!userCart) {
      // If user had no existing cart, simply assign userId to guest cart
      guestCart.userId = userId as unknown as typeof guestCart.userId;
      guestCart.lastActiveAt = new Date();
      await guestCart.save();

      return NextResponse.json({
        success: true,
        cart: guestCart,
        merged: true,
      });
    }

    // Merge items from guestCart into userCart
    const mergedItems: ICartItem[] = [...userCart.items];

    for (const gItem of guestCart.items) {
      const existingIdx = mergedItems.findIndex(
        (it) => it.productId === gItem.productId && it.weight === gItem.weight
      );

      if (existingIdx > -1) {
        mergedItems[existingIdx].quantity += gItem.quantity;
      } else {
        mergedItems.push(gItem);
      }
    }

    userCart.items = mergedItems;
    userCart.subtotal = mergedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    userCart.totalCount = mergedItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    userCart.lastActiveAt = new Date();
    await userCart.save();

    // Mark guest cart as converted/merged so it doesn't stay duplicate
    guestCart.status = "converted";
    await guestCart.save();

    return NextResponse.json({
      success: true,
      cart: userCart,
      merged: true,
    });
  } catch (error) {
    console.error("Error merging cart in DB:", error);
    return NextResponse.json(
      { success: false, error: "Failed to merge carts" },
      { status: 500 }
    );
  }
}
