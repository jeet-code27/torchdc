import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

export const dynamic = "force-dynamic";

// GET /api/orders/track?order=TORCH-123456&phone=2025550143
// Both must match: an order number or a phone number alone must not reveal someone's order.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderParam = (searchParams.get("order") || "").trim().toUpperCase();
    const phoneDigits = (searchParams.get("phone") || "").replace(/\D/g, "").slice(-10);

    if (!orderParam || phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter your order number and the mobile number used for the order." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const orderNumber = orderParam.startsWith("TORCH-") ? orderParam : `TORCH-${orderParam}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { orderNumber };

    const order = await Order.findOne(filter)
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const storedDigits = String(order?.customer?.phone || "").replace(/\D/g, "").slice(-10);
    if (!order || storedDigits !== phoneDigits) {
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
