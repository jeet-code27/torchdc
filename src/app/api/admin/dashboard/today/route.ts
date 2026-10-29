import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { canViewOrders } from "@/lib/orders/access";
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

const usd = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** Placeholder details people type when testing checkout (name "Test", example.com email, 555 phone). */
function looksLikeTest(c?: { name?: string; email?: string; phone?: string }) {
  const name = (c?.name || "").toLowerCase();
  const email = (c?.email || "").toLowerCase();
  const phone = (c?.phone || "").replace(/\D/g, "").slice(-10);
  return (
    /\b(test|tert|demo|asdf|sample)\b/.test(name) ||
    /example\.(com|org)|mailinator|@test\.|^test@/.test(email) ||
    /^\d{3}555\d{4}$/.test(phone) ||
    /^(\d)\1{9}$/.test(phone) ||
    /^(1234567890|0123456789)$/.test(phone)
  );
}

const day = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });

// GET /api/admin/dashboard/today - numbers for the mobile "Today" dashboard (test orders excluded)
export async function GET() {
  try {
    const perm = await requirePermission("dashboard.view");
    if (!perm.authorized) return perm.response;
    if (!canViewOrders(perm.user)) {
      return NextResponse.json({ success: false, error: "Forbidden: Missing orders permission" }, { status: 403 });
    }

    await connectDB();
    const now = Date.now();
    const todayStart = startOfTodayET();
    const weekStart = new Date(now - 7 * 24 * 3_600_000);
    const real = { isTest: { $ne: true } };

    const [open, deliveredToday, week] = await Promise.all([
      Order.find({ ...real, orderStatus: { $in: OPEN } })
        .select("orderNumber customer orderStatus paymentStatus total createdAt history")
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

    // Needs attention (admin update v3, one-tap cards):
    // pending > 15 min → Confirm · Decline; confirmed 2+ hr, never sent out → Send out · Complete · Cancel;
    // test-looking orders still in the live queue → Mark all as test
    type OrderCard = {
      kind: "pending" | "stale";
      orderId: string;
      orderNumber: string;
      status: string;
      title: string;
      detail: string;
      href: string;
      age: number;
    };
    const cards: OrderCard[] = [];
    const tests: typeof open = [];
    for (const o of open) {
      if (looksLikeTest(o.customer)) {
        tests.push(o);
        continue;
      }
      const created = new Date(o.createdAt);
      const age = now - created.getTime();
      const base = { orderId: String(o._id), orderNumber: o.orderNumber, status: o.orderStatus, href: `/admin/orders/${o._id}`, age };
      const who = `${shortName(o.customer?.name)} · ${usd(o.total)}`;
      if (o.orderStatus === "pending" && age >= PENDING_ALERT_MIN * 60_000) {
        cards.push({ ...base, kind: "pending", title: `${orderLabel(o.orderNumber)} new, waiting ${waited(created, now)}`, detail: `${who} · Placed ${day(created)}` });
      } else if (o.orderStatus === "confirmed") {
        const confirmedAt = [...(o.history || [])].reverse().find((h) => h.status === "confirmed")?.at;
        const since = confirmedAt ? new Date(confirmedAt) : created;
        if (now - since.getTime() >= CONFIRMED_ALERT_HOURS * 3_600_000) {
          cards.push({
            ...base,
            kind: "stale",
            title: `${orderLabel(o.orderNumber)} waiting ${waited(since, now)}`,
            detail: `${who} · Confirmed ${day(since)}, never sent out`,
          });
        }
      }
    }
    cards.sort((x, y) => Number(y.kind === "pending") - Number(x.kind === "pending") || x.age - y.age);

    const attention: unknown[] = cards.slice(0, 12).map(({ age: _age, ...c }) => c);
    if (tests.length) {
      const names = new Map<string, number>();
      for (const o of tests) {
        const n = (o.customer?.name || "Customer").trim().split(/\s+/)[0];
        names.set(n, (names.get(n) || 0) + 1);
      }
      const testCash = tests.filter((o) => o.paymentStatus !== "paid").reduce((sum, o) => sum + (o.total || 0), 0);
      attention.push({
        kind: "tests",
        orderIds: tests.map((o) => String(o._id)),
        title: `${tests.length} test order${tests.length === 1 ? "" : "s"} in the live queue`,
        detail: `${[...names].map(([n, c]) => (c > 1 ? `${n} (${c})` : n)).join(", ")}. Adding ${usd(testCash)} to cash to collect`,
      });
    }

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
      attention,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard/today error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}
