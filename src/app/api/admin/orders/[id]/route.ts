import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Order, type IOrder } from "@/models/Order";
import { orderNumberCandidates } from "@/lib/orders/order-number";
import { logStatusChange, manualStatusUpdate } from "@/lib/orders/order-status";
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
      order = await Order.findOne({ orderNumber: { $in: orderNumberCandidates(decodeURIComponent(id)) } }).lean();
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
    const { orderStatus, paymentStatus, deliveryNotes, staffNotes, isTest } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (deliveryNotes !== undefined) updates.deliveryNotes = deliveryNotes;
    if (typeof staffNotes === "string") updates.staffNotes = staffNotes.slice(0, 2000);
    if (typeof isTest === "boolean") updates.isTest = isTest;

    let current = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      current = await Order.findById(id).select("orderNumber orderStatus").lean();
    }
    if (!current) {
      current = await Order.findOne({ orderNumber: { $in: orderNumberCandidates(decodeURIComponent(id)) } })
        .select("orderNumber orderStatus")
        .lean();
    }
    if (!current) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Status changes are kept in the order history and the Activity Log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: Record<string, any> = { $set: updates };
    const statusChanged = Boolean(orderStatus) && orderStatus !== current.orderStatus;
    if (statusChanged) {
      const extra = manualStatusUpdate(current.orderStatus, orderStatus as IOrder["orderStatus"], user);
      Object.assign(updates, extra.set);
      ops.$push = extra.push;
    }

    const updatedOrder = await Order.findByIdAndUpdate(current._id, ops, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    if (statusChanged) {
      await logStatusChange(user, current, current.orderStatus, orderStatus);
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
