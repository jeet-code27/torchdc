import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Order } from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/admin/orders/[id] - Fetch single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Check if id is valid ObjectId or search by orderNumber
    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching admin order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Update single order status, notes, or payment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, deliveryNotes } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (deliveryNotes !== undefined) updates.deliveryNotes = deliveryNotes;

    let updatedOrder = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedOrder = await Order.findByIdAndUpdate(
        id,
        { $set: updates },
        { returnDocument: "after" }
      );
    }
    if (!updatedOrder) {
      updatedOrder = await Order.findOneAndUpdate(
        { orderNumber: id },
        { $set: updates },
        { returnDocument: "after" }
      );
    }

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
    console.error("Error updating single order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
