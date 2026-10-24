import { Order, type IOrder } from "@/models/Order";
import { ActivityLog } from "@/models/ActivityLog";
import type { AuthContext } from "@/lib/permissions";

export type OrderStatus = IOrder["orderStatus"];

/** One-tap flow on the admin: Placed → Confirmed → Out → Delivered & paid. */
const FLOW: OrderStatus[] = ["pending", "confirmed", "out_for_delivery", "completed"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Older pickup orders can sit at "ready_for_pickup"; it is the same step as "out". */
const flowStep = (s: OrderStatus): OrderStatus => (s === "ready_for_pickup" ? "out_for_delivery" : s);

/**
 * Moves the admin buttons can make: one step forward, Decline (pending → cancelled),
 * and one step back for Undo (including cancelled → pending).
 */
export function canMoveStatus(from: OrderStatus, to: OrderStatus) {
  const f = flowStep(from);
  if (f === to) return false;
  if (f === "pending" && to === "cancelled") return true;
  if (f === "cancelled" && to === "pending") return true;
  const i = FLOW.indexOf(f);
  const j = FLOW.indexOf(to);
  if (i < 0 || j < 0) return false;
  return j === i + 1 || j === i - 1;
}

function historyLabel(from: OrderStatus, to: OrderStatus, by: string) {
  const back = FLOW.indexOf(to) >= 0 && FLOW.indexOf(to) < FLOW.indexOf(flowStep(from));
  if (back || (from === "cancelled" && to === "pending")) return `Moved back to ${STATUS_LABEL[to]} by ${by}`;
  switch (to) {
    case "confirmed":
      return `Confirmed by ${by}`;
    case "out_for_delivery":
      return `Sent out by ${by}`;
    case "completed":
      return `Delivered & paid, marked by ${by}`;
    case "cancelled":
      return from === "pending" ? `Declined by ${by}` : `Cancelled by ${by}`;
    default:
      return `Set to ${STATUS_LABEL[to]} by ${by}`;
  }
}

/** Fields that change with the status: Delivered = cash collected; undoing it reopens the payment. */
function statusSideEffects(from: OrderStatus, to: OrderStatus, now: Date) {
  const set: Record<string, unknown> = { orderStatus: to };
  if (to === "completed") {
    set.paymentStatus = "paid";
    set.completedAt = now;
  } else if (from === "completed") {
    set.paymentStatus = "pending";
    set.completedAt = null;
  }
  return set;
}

async function logStatusChange(user: AuthContext, order: { _id: unknown; orderNumber: string }, from: OrderStatus, to: OrderStatus) {
  try {
    await ActivityLog.create({
      action: "order.status_change",
      description: `${order.orderNumber}: ${STATUS_LABEL[from]} → ${STATUS_LABEL[to]}`,
      actor: {
        userId: user.userId,
        name: user.name || "Admin",
        email: user.email || "unknown",
        role: user.role || "admin",
      },
      entityType: "order",
      entityId: String(order._id),
      metadata: { from, to },
    });
  } catch (err) {
    // The status is saved; a failed log line must not undo it
    console.error("[orders] activity log failed", err);
  }
}

export class StatusMoveError extends Error {}

/**
 * The one-tap status change used by the new Orders screens.
 * Validates every order first, so a bad batch changes nothing.
 */
export async function moveOrdersToStatus(orderIds: string[], to: OrderStatus, user: AuthContext) {
  const orders = await Order.find({ _id: { $in: orderIds } }).select("orderNumber orderStatus").lean();
  if (orders.length !== orderIds.length) throw new StatusMoveError("Some of these orders no longer exist.");

  const blocked = orders.filter((o) => !canMoveStatus(o.orderStatus, to));
  if (blocked.length) {
    throw new StatusMoveError(
      `${blocked.map((o) => o.orderNumber).join(", ")} can't go from ${STATUS_LABEL[blocked[0].orderStatus]} to ${STATUS_LABEL[to]}. Refresh and try again.`
    );
  }

  const by = user.name || "Admin";
  const updated = [];
  for (const o of orders) {
    const now = new Date();
    // Only if nobody changed it in the meantime
    const doc = await Order.findOneAndUpdate(
      { _id: o._id, orderStatus: o.orderStatus },
      {
        $set: statusSideEffects(o.orderStatus, to, now),
        $push: { history: { at: now, label: historyLabel(o.orderStatus, to, by), status: to } },
      },
      { returnDocument: "after" }
    ).lean();
    if (!doc) throw new StatusMoveError(`${o.orderNumber} was just changed by someone else. Refresh and try again.`);
    await logStatusChange(user, o, o.orderStatus, to);
    updated.push(doc);
  }
  return updated;
}

/**
 * For the full order editor (any status from the dropdown): keeps history and the Activity Log
 * in step with the one-tap buttons. Returns the extra update operators to merge in.
 */
export function manualStatusUpdate(from: OrderStatus, to: OrderStatus, user: AuthContext) {
  const now = new Date();
  const set: Record<string, unknown> = { orderStatus: to };
  if (to === "completed") set.completedAt = now;
  else if (from === "completed") set.completedAt = null;
  return {
    set,
    push: { history: { at: now, label: historyLabel(from, to, user.name || "Admin"), status: to } },
  };
}

export { logStatusChange };
