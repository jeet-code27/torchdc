import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

export const dynamic = "force-dynamic";

// GET /api/orders/track?q=TORCH-123456 or ?q=2025550143
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please enter an order number or phone number" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const digitsOnly = q.replace(/\D/g, "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (q.toUpperCase().startsWith("TORCH-") || /^\d{6}$/.test(q)) {
      // Order number search
      const formattedOrderNo = q.toUpperCase().startsWith("TORCH-")
        ? q.toUpperCase()
        : `TORCH-${q}`;
      filter.orderNumber = formattedOrderNo;
    } else if (digitsOnly.length >= 7) {
      // Phone number search
      filter.$or = [
        { "customer.phone": q },
        { "customer.phone": digitsOnly },
        { "customer.phone": new RegExp(digitsOnly.slice(-10)) },
      ];
    } else {
      filter.$or = [
        { orderNumber: q.toUpperCase() },
        { "customer.email": q.toLowerCase() },
      ];
    }

    const order = await Order.findOne(filter)
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching order found. Please verify your order number or phone number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        fulfillment: order.fulfillment,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        total: order.total,
        deliveryFee: order.deliveryFee,
        deliveryNotes: order.deliveryNotes,
        deliveryAddress:
          order.fulfillment === "delivery"
            ? {
                city: order.deliveryAddress?.city || "Washington",
                state: "DC",
                zip: order.deliveryAddress?.zip,
              }
            : undefined,
        items: order.items.map((it) => ({
          productId: it.productId,
          name: it.name,
          image: it.image,
          price: it.price,
          quantity: it.quantity,
          weight: it.weight,
        })),
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track order" },
      { status: 500 }
    );
  }
}
