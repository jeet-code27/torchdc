import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Order, Product, Category, Brand, User, Role } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const perm = await requirePermission("dashboard.view");
    if (!perm.authorized) return perm.response;

    await connectDB();

    // 1. Order Metrics
    const allOrders = await Order.find().sort({ createdAt: -1 }).lean();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    let totalRevenue = 0;
    let todayOrdersCount = 0;
    let todayDelivery = 0;
    let todayPickup = 0;

    let deliveryActive = 0;
    let deliveryPending = 0;
    let deliveryOut = 0;

    let pickupActive = 0;
    let pickupPending = 0;
    let pickupReady = 0;

    for (const order of allOrders) {
      if (order.orderStatus !== "cancelled") {
        totalRevenue += order.total || 0;
      }

      const orderDate = new Date(order.createdAt);
      if (orderDate >= startOfToday) {
        todayOrdersCount++;
        if (order.fulfillment === "pickup") {
          todayPickup++;
        } else {
          todayDelivery++;
        }
      }

      // Fulfillment queues
      if (order.fulfillment === "pickup") {
        if (["pending", "confirmed", "ready_for_pickup"].includes(order.orderStatus)) {
          pickupActive++;
          if (order.orderStatus === "ready_for_pickup") {
            pickupReady++;
          } else {
            pickupPending++;
          }
        }
      } else {
        if (["pending", "confirmed", "out_for_delivery"].includes(order.orderStatus)) {
          deliveryActive++;
          if (order.orderStatus === "out_for_delivery") {
            deliveryOut++;
          } else {
            deliveryPending++;
          }
        }
      }
    }

    // 2. Catalog Metrics
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ inStock: true, isActive: true });
    const totalCategories = await Category.countDocuments();
    const totalBrands = await Brand.countDocuments();

    // 3. Customers Metrics
    const customerRole = await Role.findOne({ key: "customer" }).lean();
    const userFilter = customerRole ? { role: customerRole._id, isDeleted: false } : { isDeleted: false };
    const totalCustomers = await User.countDocuments(userFilter);
    const newCustomersThisWeek = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: startOfWeek },
    });

    // 4. Recent 5 Orders
    const recentOrders = allOrders.slice(0, 5).map((o) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.customer?.name || "Customer",
      customerEmail: o.customer?.email || "",
      total: o.total || 0,
      status: o.orderStatus,
      fulfillmentType: o.fulfillment || "delivery",
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        todayOrdersCount,
        todayDelivery,
        todayPickup,
        totalProducts,
        inStockProducts,
        totalCategories,
        totalBrands,
        totalCustomers,
        newCustomersThisWeek,
        queues: {
          delivery: {
            active: deliveryActive,
            pending: deliveryPending,
            outForDelivery: deliveryOut,
          },
          pickup: {
            active: pickupActive,
            pending: pickupPending,
            ready: pickupReady,
          },
        },
      },
      recentOrders,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
