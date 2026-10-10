import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const perm = await requirePermission("customers.view");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();
    const { id } = await params;
    const targetId = decodeURIComponent(id);

    // Can be user ObjectId, guest_{id}, or email/phone
    let userDoc: any = null;
    let customerEmail = "";
    let customerPhone = "";
    let isRegistered = false;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      userDoc = await User.findById(targetId).populate("role").lean();
      if (userDoc) {
        customerEmail = userDoc.email;
        customerPhone = userDoc.phone || "";
        isRegistered = true;
      }
    }

    if (!userDoc && targetId.startsWith("guest_")) {
      const orderId = targetId.replace("guest_", "");
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        const order = await Order.findById(orderId).lean();
        if (order?.customer) {
          customerEmail = order.customer.email || "";
          customerPhone = order.customer.phone || "";
        }
      }
    }

    if (!userDoc && !customerEmail && !customerPhone) {
      if (targetId.includes("@")) {
        customerEmail = targetId.toLowerCase().trim();
      } else {
        customerPhone = targetId;
      }
    }

    // Find all orders for this customer
    const orConditions: any[] = [];
    if (userDoc?._id) orConditions.push({ userId: userDoc._id });
    if (customerEmail) orConditions.push({ "customer.email": customerEmail.toLowerCase() });
    if (customerPhone) {
      const digits = customerPhone.replace(/\D/g, "");
      orConditions.push({ "customer.phone": customerPhone });
      if (digits.length >= 7) {
        orConditions.push({ "customer.phone": new RegExp(digits.slice(-10)) });
      }
    }

    const orders = orConditions.length > 0
      ? await Order.find({ $or: orConditions }).sort({ createdAt: -1 }).lean()
      : [];

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Aggregate unique delivery addresses
    const addresses: any[] = [];
    for (const o of orders) {
      if (o.deliveryAddress?.street) {
        const aKey = `${o.deliveryAddress.street}-${o.deliveryAddress.zip}`;
        if (!addresses.some((a) => `${a.street}-${a.zip}` === aKey)) {
          addresses.push(o.deliveryAddress);
        }
      }
    }

    const primaryName = userDoc?.name || orders[0]?.customer?.name || "Customer";
    const primaryEmail = userDoc?.email || orders[0]?.customer?.email || customerEmail;
    const primaryPhone = userDoc?.phone || orders[0]?.customer?.phone || customerPhone;

    return NextResponse.json({
      success: true,
      customer: {
        id: userDoc?._id?.toString() || targetId,
        name: primaryName,
        email: primaryEmail,
        phone: primaryPhone,
        isRegistered,
        totalOrders,
        totalSpent,
        averageOrderValue,
        addresses,
        joinedAt: userDoc?.createdAt || orders[orders.length - 1]?.createdAt || new Date(),
        orders,
      },
    });
  } catch (error) {
    console.error("Failed to load customer profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load customer profile" },
      { status: 500 }
    );
  }
}
