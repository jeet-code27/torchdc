import { NextResponse, after } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { Coupon } from "@/models/Coupon";
import { StoreSettings } from "@/models/StoreSettings";
import { auth } from "@/auth";
import { computeDeals, unitOf, MIN_ORDER } from "@/lib/deals";
import { verifyCartItems, CartItemError } from "@/lib/verify-cart-items";
import {
  sendOrderConfirmationEmail,
  sendAdminNewOrderNotification,
} from "@/lib/email";
import { nextOrderNumber } from "@/lib/orders/order-number";
import { alertNewOrder } from "@/lib/push/order-alerts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      fulfillment,
      deliveryAddress,
      deliveryNotes,
      changeFor,
      firstOrder,
      prerollBonus,
      items,
      sessionId,
      isAgeVerified,
      couponCode,
    } = body;

    // Validate customer fields
    if (!customer?.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name." },
        { status: 400 }
      );
    }

    const phoneDigits = String(customer?.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile phone number (e.g. (202) 555-0143)." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty. Please add items to order." },
        { status: 400 }
      );
    }

    if (fulfillment === "delivery" && (!deliveryAddress?.street || !deliveryAddress?.street.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide your delivery street address." },
        { status: 400 }
      );
    }

    if (!isAgeVerified) {
      return NextResponse.json(
        { success: false, error: "You must confirm you are 21 years of age or older." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Admin dashboard switches: "Accepting delivery orders" and "Store pickup"
    const storeSettings = await StoreSettings.findOne({ key: "default" }).select("deliveryEnabled pickupEnabled").lean();
    if (fulfillment === "pickup" && !storeSettings?.pickupEnabled) {
      return NextResponse.json(
        { success: false, error: "Store pickup is paused right now. Switch to delivery to place your order." },
        { status: 400 }
      );
    }
    if (fulfillment !== "pickup" && storeSettings?.deliveryEnabled === false) {
      return NextResponse.json(
        { success: false, error: "We're not taking delivery orders right now. Please call or text (202) 468-1966." },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    // Re-price every line from the database (never trust browser prices or tiers)
    let orderItems;
    try {
      orderItems = await verifyCartItems(items);
    } catch (err) {
      if (err instanceof CartItemError) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
      }
      throw err;
    }

    const subtotal = orderItems.reduce(
      (sum: number, it: { price: number; quantity: number }) =>
        sum + it.price * it.quantity,
      0
    );

    // Server-verified automatic flower deals
    const dealLines = orderItems.map((it: any) => ({
      tier: it.tier,
      unit: unitOf(it.weight),
      price: it.price,
      qty: it.quantity,
    }));
    const computedDeals = computeDeals(dealLines);
    const dealsDiscount = computedDeals.total;
    const dealsBreakdown = computedDeals.items;

    // $60 order minimum after deal discounts (same rule as the client site's api/order.js)
    const due = subtotal - dealsDiscount;
    if (due < MIN_ORDER) {
      const short = Number((MIN_ORDER - due).toFixed(2));
      return NextResponse.json(
        { success: false, error: `Orders have a $${MIN_ORDER} minimum. Add $${short} more to check out.` },
        { status: 400 }
      );
    }

    // Apply Coupon Code if provided
    let couponDiscountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const couponDoc = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (couponDoc) {
        const now = new Date();
        const isValidDate =
          (!couponDoc.startDate || new Date(couponDoc.startDate) <= now) &&
          (!couponDoc.endDate || new Date(couponDoc.endDate) >= now);
        const hasUsesLeft =
          !couponDoc.usageLimit || (couponDoc.usageCount || 0) < couponDoc.usageLimit;
        const meetsMin =
          !couponDoc.minOrderAmount || subtotal >= couponDoc.minOrderAmount;

        if (isValidDate && hasUsesLeft && meetsMin) {
          if (couponDoc.discountType === "percentage") {
            couponDiscountAmount = (subtotal * couponDoc.discountValue) / 100;
            if (couponDoc.maxDiscount && couponDiscountAmount > couponDoc.maxDiscount) {
              couponDiscountAmount = couponDoc.maxDiscount;
            }
          } else if (couponDoc.discountType === "fixed_amount") {
            couponDiscountAmount = Math.min(couponDoc.discountValue, subtotal);
          }
          couponDiscountAmount = Number(couponDiscountAmount.toFixed(2));
          appliedCouponCode = cleanCode;

          // Increment usage count
          await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usageCount: 1 } });
        }
      }
    }

    const discountAmount = Number((dealsDiscount + couponDiscountAmount).toFixed(2));
    const deliveryFee = 0; // Free delivery across DC
    const total = Math.max(0, Number((subtotal - discountAmount + deliveryFee).toFixed(2)));

    // Short sequential order number (#1001, #1002, ...); older orders keep their TORCH-xxxxxx numbers
    const orderNumber = await nextOrderNumber();

    const formattedNotes = [
      deliveryNotes?.trim() || "",
      changeFor ? `Needs change for $${changeFor}` : "",
      firstOrder ? "FIRST ORDER: throw in something on the house" : "",
      prerollBonus ? "Switched from pickup: add a free pre-roll" : "",
    ]
      .filter(Boolean)
      .join("\n");

    const newOrder = new Order({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim().toLowerCase() : "",
        phone: customer.phone.trim(),
      },
      fulfillment: fulfillment === "pickup" ? "pickup" : "delivery",
      deliveryAddress:
        fulfillment === "delivery"
          ? {
              street: deliveryAddress?.street?.trim() || "",
              apartment: deliveryAddress?.apartment?.trim() || "",
              city: deliveryAddress?.city?.trim() || "Washington",
              state: "DC",
              zip: deliveryAddress?.zip?.trim() || "20004",
            }
          : undefined,
      deliveryNotes: formattedNotes,
      changeFor: changeFor ? String(changeFor).trim() : "",
      firstOrder: Boolean(firstOrder),
      prerollBonus: Boolean(prerollBonus),
      dealsBreakdown,
      pickupLocation: "1000 G St NW, Washington, DC",
      items: orderItems,
      subtotal,
      deliveryFee,
      couponCode: appliedCouponCode,
      discountAmount,
      total,
      paymentMethod:
        fulfillment === "pickup" ? "cash_on_pickup" : "cash_on_delivery",
      paymentStatus: "pending",
      // New orders wait for staff to confirm them with one tap in the admin
      orderStatus: "pending",
      history: [{ at: new Date(), label: "Order placed by customer", status: "pending" }],
      isAgeVerified: true,
      sessionId: sessionId || "",
      userId: userId ? new mongoose.Types.ObjectId(userId) : null,
    });

    await newOrder.save();

    // Mark active cart as converted so it doesn't get flagged as abandoned
    if (sessionId) {
      await Cart.updateMany(
        { sessionId, status: "active" },
        {
          $set: {
            status: "converted",
            convertedOrderId: newOrder._id,
            lastActiveAt: new Date(),
          },
        }
      );
    }
    if (userId) {
      await Cart.updateMany(
        { userId, status: "active" },
        {
          $set: {
            status: "converted",
            convertedOrderId: newOrder._id,
            lastActiveAt: new Date(),
          },
        }
      );
    }

    // Send emails right after the response. after() keeps the serverless function alive
    // until they finish (a plain fire-and-forget promise can be cut off on Vercel).
    after(async () => {
      await Promise.allSettled([
        sendOrderConfirmationEmail(newOrder),
        sendAdminNewOrderNotification(newOrder),
        alertNewOrder(newOrder),
      ]);
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      total: newOrder.total,
    });
  } catch (error) {
    console.error("Checkout order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process your order. Please try again or call us at (202) 468-1966." },
      { status: 500 }
    );
  }
}
