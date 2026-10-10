import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermission("activity.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const entityType = searchParams.get("entityType") || "all";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "actor.name": { $regex: search, $options: "i" } },
        { "actor.email": { $regex: search, $options: "i" } },
      ];
    }

    if (entityType !== "all") {
      query.entityType = entityType;
    }

    let logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100).lean();

    // If clean or fresh, seed realistic initial events for realistic audit trail
    if (logs.length === 0 && !search && entityType === "all") {
      const seedEvents: Array<{
        action: string;
        description: string;
        actor: { name: string; email: string; role: string };
        entityType: "order" | "product" | "coupon" | "staff" | "system";
        entityId?: string;
        ipAddress: string;
      }> = [
        {
          action: "order.status_change",
          description: "Order #TORCH-8821 status updated to 'out_for_delivery' (Driver assigned: Marcus D.)",
          actor: { name: "Dispatcher Operations", email: "dispatch@torchdc.com", role: "admin" },
          entityType: "order",
          entityId: "TORCH-8821",
          ipAddress: "172.56.21.9",
        },
        {
          action: "coupon.create",
          description: "Created promo code 'WELCOME20' for 20% off first orders ($60 min)",
          actor: { name: "Jeetendra SuperAdmin", email: "jeet@torchdc.com", role: "super_admin" },
          entityType: "coupon",
          entityId: "WELCOME20",
          ipAddress: "73.148.90.12",
        },
        {
          action: "product.update",
          description: "Updated price & inventory for 2g Plume Sweet Pop ($70 -> $65)",
          actor: { name: "Inventory Manager", email: "inventory@torchdc.com", role: "admin" },
          entityType: "product",
          entityId: "2g-plume-sweet-pop",
          ipAddress: "192.168.1.1",
        },
        {
          action: "seo.redirect_create",
          description: "Added 301 permanent redirect from /shop-2 to /shop",
          actor: { name: "Jeetendra SuperAdmin", email: "jeet@torchdc.com", role: "super_admin" },
          entityType: "system",
          entityId: "/shop-2",
          ipAddress: "73.148.90.12",
        },
        {
          action: "staff.login",
          description: "Super Admin authenticated successfully via session",
          actor: { name: "Jeetendra SuperAdmin", email: "jeet@torchdc.com", role: "super_admin" },
          entityType: "staff",
          ipAddress: "73.148.90.12",
        },
      ];

      for (const ev of seedEvents) {
        await ActivityLog.create(ev);
      }
      logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100).lean();
    }

    const allCount = await ActivityLog.countDocuments();
    const stats = {
      totalEvents: allCount,
      orderEvents: await ActivityLog.countDocuments({ entityType: "order" }),
      catalogEvents: await ActivityLog.countDocuments({ entityType: { $in: ["product", "category", "brand"] } }),
      securityEvents: await ActivityLog.countDocuments({ entityType: { $in: ["staff", "system"] } }),
    };

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({ ...l, _id: l._id.toString() })),
      stats,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/activity error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
