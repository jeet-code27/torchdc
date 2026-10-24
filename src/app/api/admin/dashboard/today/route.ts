import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Order, type IOrder } from "@/models/Order";
import { orderLabel } from "@/lib/orders/display";

export const dynamic = "force-dynamic";

const OPEN: IOrder["orderStatus"][] = ["pending", "confirmed", "out_for_delivery", "ready_for_pickup"];
const PENDING_ALERT_MIN = 15; // pending orders older than this need attention
const CONFIRMED_ALERT_HOURS = 2; // confirmed but not sent out after this

/** Midnight today in Washington, DC, as a Date. */
function startOfTodayET(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0);
  const msIntoDay = ((get("hour") * 60 + get("minute")) * 60 + get("second")) * 1000;
  return new Date(now.getTime() - msIntoDay - now.getMilliseconds());
}

function waited(from: Date, now: number) {
  const mins = Math.max(0, Math.round((now - from.getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

const shortName = (name?: string) => {
  const [first, last] = (name || "Customer").trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
};

const day = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

// GET /api/admin/dashboard/today - numbers for the mobile "Today" dashboard (test orders excluded)
export async function GET() {
  try {
    const perm = await requirePermission("dashboard.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const now = Date.now();
    const todayStart = startOfTodayET();
    const weekStart = new Date(now - 7 * 24 * 3_600_000);
    const real = { isTest: { $ne: true } };

    const [open, deliveredToday, week] = await Promise.all([
      Order.find({ ...real, orderStatus: { $in: OPEN } })
        .select("orderNumber customer.name orderStatus paymentStatus total createdAt history")
        .sort({ createdAt: 1 })
        .lean(),
      Order.countDocuments({
        ...real,
        orderStatus: "completed",
        $or: [{ completedAt: { $gte: todayStart } }, { completedAt: null, updatedAt: { $gte: todayStart } }],
      }),
      Order.find({ ...real, createdAt: { $gte: weekStart }, orderStatus: { $ne: "cancelled" } })
        .select("orderStatus paymentStatus total")
        .lean(),
    ]);

    const pending = open.filter((o) => o.orderStatus === "pending");
    const outNow = open.filter((o) => o.orderStatus === "out_for_delivery" || o.orderStatus === "ready_for_pickup").length;
    const cashToCollect = open.filter((o) => o.paymentStatus !== "paid").reduce((s, o) => s + (o.total || 0), 0);

    const weekTotal = week.reduce((s, o) => s + (o.total || 0), 0);
    const cashCollected = week
      .filter((o) => o.orderStatus === "completed" || o.paymentStatus === "paid")
      .reduce((s, o) => s + (o.total || 0), 0);

    // Needs attention: pending > 15 min, confirmed but not sent out after 2 hr
    const attention: Array<{ id: string; tone: "urgent" | "warning"; title: string; detail: string; actionLabel: string; href: string; age: number }> = [];
    for (const o of open) {
      const created = new Date(o.createdAt);
      const age = now - created.getTime();
      const href = `/admin/orders/${o._id}`;
      if (o.orderStatus === "pending" && age >= PENDING_ALERT_MIN * 60_000) {
        attention.push({
          id: String(o._id),
          tone: "urgent",
          title: `${orderLabel(o.orderNumber)} not confirmed · ${waited(created, now)}`,
          detail: `${shortName(o.customer?.name)} · Placed ${day(created)}`,
          actionLabel: "Review order",
          href,
          age,
        });
      } else if (o.orderStatus === "confirmed") {
        const confirmedAt = [...(o.history || [])].reverse().find((h) => h.status === "confirmed")?.at;
        const since = confirmedAt ? new Date(confirmedAt) : created;
        if (now - since.getTime() >= CONFIRMED_ALERT_HOURS * 3_600_000) {
          attention.push({
            id: String(o._id),
            tone: "warning",
            title: `${orderLabel(o.orderNumber)} waiting ${waited(since, now)}`,
            detail: `${shortName(o.customer?.name)} · Confirmed ${day(since)}, never sent out`,
            actionLabel: "Open order",
            href,
            age,
          });
        }
      }
    }
    attention.sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent") || a.age - b.age);

    return NextResponse.json({
      success: true,
      newOrders: {
        count: pending.length,
        oldestWait: pending.length ? waited(new Date(pending[0].createdAt), now) : undefined,
      },
      today: { outNow, deliveredToday, cashToCollect: Number(cashToCollect.toFixed(2)) },
      week: {
        cashCollected: Number(cashCollected.toFixed(2)),
        pendingCash: Number((weekTotal - cashCollected).toFixed(2)),
        orders: week.length,
        avgOrder: week.length ? Number((weekTotal / week.length).toFixed(2)) : 0,
      },
      attention: attention.slice(0, 12).map(({ age: _age, ...a }) => a),
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/today error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}
