import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Order } from "@/models/Order";

export const dynamic = "force-dynamic";

// GET /api/admin/orders - Fetch orders with filters, search, and pagination
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hasAccess =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "store_manager" ||
      user.permissions.includes("*") ||
      user.permissions.includes("orders.view") ||
      user.permissions.includes("orders.manage");

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Missing orders permission" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");
    const fulfillment = searchParams.get("fulfillment");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.orderStatus = status;
    }

    if (fulfillment && fulfillment !== "all") {
      filter.fulfillment = fulfillment;
    }

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { orderNumber: regex },
        { "customer.name": regex },
        { "customer.email": regex },
        { "customer.phone": regex },
      ];
    }

    const [orders, total, countsByStatus] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      statusSummary: countsByStatus.reduce((acc, curr) => {
        acc[curr._id] = { count: curr.count, total: curr.totalAmount };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders - Update order status
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const hasAccess =
      user.role === "super_admin" ||
      user.role === "admin" ||
      user.role === "store_manager" ||
      user.permissions.includes("*") ||
      user.permissions.includes("orders.edit") ||
      user.permissions.includes("orders.manage");

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Missing orders edit permission" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { orderId, orderStatus, paymentStatus, deliveryNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (deliveryNotes !== undefined) updates.deliveryNotes = deliveryNotes;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating admin order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
