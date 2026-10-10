import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { Order } from "@/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  lastOrderStatus: string | null;
  addresses: Array<{
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  const perm = await requirePermission("customers.view");
  if (!perm.authorized) return perm.response;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("q") || "").trim().toLowerCase();
    const type = searchParams.get("type") || "all"; // all, registered, guest
    const sort = searchParams.get("sort") || "spend"; // spend, orders, recent, name

    // 1. Fetch Registered Customer Role
    const customerRole = await Role.findOne({ key: "customer" }).lean();
    const customerRoleId = customerRole?._id;

    // 2. Fetch all registered users who have the customer role
    const registeredQuery: Record<string, any> = { isDeleted: false };
    if (customerRoleId) {
      registeredQuery.role = customerRoleId;
    }

    const registeredUsers = await User.find(registeredQuery)
      .select("name email phone createdAt isActive")
      .lean();

    // Map by lowercase email and clean phone
    const customersMap = new Map<string, CustomerSummary>();

    for (const u of registeredUsers) {
      const emailKey = u.email?.toLowerCase().trim();
      if (!emailKey) continue;

      customersMap.set(emailKey, {
        id: u._id.toString(),
        name: u.name || "Customer",
        email: u.email,
        phone: u.phone || "",
        isRegistered: true,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        lastOrderStatus: null,
        addresses: [],
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      });
    }

    // 3. Fetch all orders to aggregate customer spending, orders, and guest accounts
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .select("orderNumber customer deliveryAddress fulfillment total orderStatus createdAt userId")
      .lean();

    for (const ord of orders) {
      const custEmail = ord.customer?.email?.toLowerCase().trim() || "";
      const custPhone = ord.customer?.phone?.trim() || "";
      const custName = ord.customer?.name?.trim() || "Guest Customer";

      const key = custEmail || (custPhone ? `phone_${custPhone}` : ord._id.toString());

      let entry = customersMap.get(key);

      if (!entry) {
        // Try matching by phone if email wasn't found
        if (custPhone) {
          for (const c of customersMap.values()) {
            if (c.phone && c.phone.replace(/\D/g, "") === custPhone.replace(/\D/g, "")) {
              entry = c;
              break;
            }
          }
        }
      }

      if (!entry) {
        // Create Guest Customer entry
        entry = {
          id: `guest_${ord._id.toString()}`,
          name: custName,
          email: ord.customer?.email || "",
          phone: custPhone,
          isRegistered: false,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          lastOrderStatus: null,
          addresses: [],
          createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
        };
        customersMap.set(key, entry);
      }

      // Aggregate Metrics
      entry.totalOrders += 1;
      entry.totalSpent += ord.total || 0;

      if (!entry.lastOrderDate) {
        entry.lastOrderDate = ord.createdAt ? new Date(ord.createdAt).toISOString() : null;
        entry.lastOrderStatus = ord.orderStatus || null;
      }

      // Collect Address if delivery
      if (ord.deliveryAddress?.street) {
        const addrKey = `${ord.deliveryAddress.street}-${ord.deliveryAddress.zip}`;
        const alreadyExists = entry.addresses.some(
          (a) => `${a.street}-${a.zip}` === addrKey
        );
        if (!alreadyExists && entry.addresses.length < 5) {
          entry.addresses.push({
            street: ord.deliveryAddress.street,
            apartment: ord.deliveryAddress.apartment,
            city: ord.deliveryAddress.city || "Washington",
            state: ord.deliveryAddress.state || "DC",
            zip: ord.deliveryAddress.zip,
          });
        }
      }

      // Update name/phone if guest had better info
      if (!entry.phone && custPhone) entry.phone = custPhone;
      if ((!entry.name || entry.name === "Customer") && custName) entry.name = custName;
    }

    // Convert map to array
    let customersList = Array.from(customersMap.values());

    // Apply Filters
    if (type === "registered") {
      customersList = customersList.filter((c) => c.isRegistered);
    } else if (type === "guest") {
      customersList = customersList.filter((c) => !c.isRegistered);
    }

    if (search) {
      customersList = customersList.filter((c) => {
        const n = c.name.toLowerCase();
        const e = c.email.toLowerCase();
        const p = c.phone.replace(/\D/g, "");
        const cleanSearch = search.replace(/\D/g, "");

        return (
          n.includes(search) ||
          e.includes(search) ||
          (cleanSearch && p.includes(cleanSearch))
        );
      });
    }

    // Apply Sorting
    customersList.sort((a, b) => {
      if (sort === "spend") return b.totalSpent - a.totalSpent;
      if (sort === "orders") return b.totalOrders - a.totalOrders;
      if (sort === "recent") {
        const aDate = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        const bDate = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
        return bDate - aDate;
      }
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    // Summary Analytics
    const totalCustomers = customersMap.size;
    const registeredCount = Array.from(customersMap.values()).filter((c) => c.isRegistered).length;
    const guestCount = totalCustomers - registeredCount;
    const totalRevenue = Array.from(customersMap.values()).reduce((sum, c) => sum + c.totalSpent, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        registeredCount,
        guestCount,
        totalRevenue,
      },
      customers: customersList,
    });
  } catch (error) {
    console.error("Failed to load customers directory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load customers" },
      { status: 500 }
    );
  }
}
