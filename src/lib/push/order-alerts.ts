import { isPushConfigured, sendAlert, type AlertPayload } from './webpush';

/** The subset of the existing Order document these alerts read. */
export type OrderForAlert = {
  _id: unknown;
  orderNumber: string;
  total: number;
  fulfillment?: 'delivery' | 'pickup' | string;
  customer?: { name?: string };
  deliveryAddress?: { zip?: string; city?: string };
  items?: Array<{ quantity?: number }>;
};

const money = (n: number) => `$${Number(n || 0).toFixed(2).replace(/\.00$/, '')}`;

function describe(order: OrderForAlert) {
  const firstName = (order.customer?.name || 'Customer').trim().split(/\s+/)[0];
  const count = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
  const where =
    order.fulfillment === 'pickup'
      ? 'Pickup'
      : `Delivery${order.deliveryAddress?.zip ? ` to ${order.deliveryAddress.zip}` : ''}`;
  // No product names: lock screens stay discreet.
  return `${firstName} · ${count} item${count === 1 ? '' : 's'} · ${where}`;
}

function base(order: OrderForAlert): Pick<AlertPayload, 'url' | 'tag'> {
  const id = String(order._id);
  return { url: `/admin/orders/${id}`, tag: `order-${id}` };
}

/** Call right after a new order is saved. Never throws, so checkout can't fail because of push. */
export async function alertNewOrder(order: OrderForAlert): Promise<void> {
  // Push is optional: without VAPID keys the order emails still go out
  if (!isPushConfigured()) return;
  try {
    await sendAlert({
      ...base(order),
      title: `New order ${order.orderNumber} · ${money(order.total)}`,
      body: `${describe(order)}. Tap to confirm.`,
    });
  } catch (err) {
    console.error('[push] new order alert failed', err);
  }
}

/** Sent by the reminder job when an order is still pending after the wait period. */
export async function alertStillPending(order: OrderForAlert): Promise<void> {
  await sendAlert(
    {
      ...base(order),
      title: `Still waiting: ${order.orderNumber}`,
      body: 'Not confirmed yet. Tap to confirm.',
    },
    { remindersOnly: true }
  );
}
