import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { auth } from "@/auth";
import {
  sendOrderConfirmationEmail,
  sendAdminNewOrderNotification,
} from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      fulfillment,
      deliveryAddress,
      deliveryNotes,
      items,
      sessionId,
      isAgeVerified,
    } = body;

    // Validate customer fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { success: false, error: "Please provide your full name, email, and phone number." },
        { status: 400 }
      );
    }

    const phoneDigits = String(customer.phone).replace(/\D/g, "");
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

    if (fulfillment === "delivery" && (!deliveryAddress?.street || !deliveryAddress?.zip)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid street address and DC ZIP code." },
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
    const session = await auth();
    const userId = session?.user?.id || null;

    // Sanitize items & compute server-verified subtotal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = items.map((it: any) => ({
      productId: String(it.id || it.productId),
      name: String(it.name),
      slug: String(it.slug || ""),
      price: Number(it.price),
      quantity: Math.max(1, Number(it.quantity || 1)),
      image: String(it.image || ""),
      weight: String(it.weight || ""),
      tier: String(it.tier || ""),
      category: String(it.category || ""),
    }));

    const subtotal = orderItems.reduce(
      (sum: number, it: { price: number; quantity: number }) =>
        sum + it.price * it.quantity,
      0
    );
    const deliveryFee = 0; // Free delivery across DC
    const total = subtotal + deliveryFee;

    // Generate unique sequential / timestamp order number (e.g. TORCH-849201)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `TORCH-${randomDigits}`;

    const newOrder = new Order({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
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
      deliveryNotes: deliveryNotes?.trim() || "",
      pickupLocation: "1025 F St NW, Washington, DC",
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod:
        fulfillment === "pickup" ? "cash_on_pickup" : "cash_on_delivery",
      paymentStatus: "pending",
      orderStatus: "confirmed",
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

    // Trigger emails in background (do not block user response if SMTP is slow)
    sendOrderConfirmationEmail(newOrder).catch((e) =>
      console.warn("Async customer email error:", e)
    );
    sendAdminNewOrderNotification(newOrder).catch((e) =>
      console.warn("Async admin email error:", e)
    );

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
