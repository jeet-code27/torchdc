import type { AdminOrder, OrderStatus } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Raw order from /api/admin/orders → the shape the new admin screens use.
 * - Older pickup orders at "ready_for_pickup" show as the same step as "Out".
 * - Checkout stores "Needs change for $X" inside deliveryNotes as well as in changeFor;
 *   the screens show changeFor on its own, so that line is left out of the note.
 */
export function toAdminOrder(raw: any): AdminOrder {
  const status: OrderStatus = raw.orderStatus === 'ready_for_pickup' ? 'out_for_delivery' : raw.orderStatus;
  const note = String(raw.deliveryNotes || '')
    .split('\n')
    .filter((line) => !/^Needs change for \$/.test(line.trim()))
    .join('\n')
    .trim();
  return {
    _id: String(raw._id),
    orderNumber: raw.orderNumber,
    customer: { name: raw.customer?.name || 'Customer', phone: raw.customer?.phone || '', email: raw.customer?.email || '' },
    fulfillment: raw.fulfillment === 'pickup' ? 'pickup' : 'delivery',
    deliveryAddress: raw.deliveryAddress || undefined,
    deliveryNotes: note || undefined,
    changeFor: raw.changeFor || undefined,
    staffNotes: raw.staffNotes || '',
    items: (raw.items || []).map((i: any) => ({
      name: i.name,
      quantity: Number(i.quantity) || 1,
      price: Number(i.price) || 0,
      weight: i.weight || undefined,
      category: i.category || undefined,
    })),
    subtotal: Number(raw.subtotal) || 0,
    discountAmount: Number(raw.discountAmount) || 0,
    deliveryFee: Number(raw.deliveryFee) || 0,
    couponCode: raw.couponCode || undefined,
    total: Number(raw.total) || 0,
    paymentStatus: raw.paymentStatus || 'pending',
    orderStatus: status,
    isAgeVerified: Boolean(raw.isAgeVerified),
    isTest: Boolean(raw.isTest),
    createdAt: new Date(raw.createdAt).toISOString(),
    history: (raw.history || []).map((h: any) => ({ at: new Date(h.at).toISOString(), label: h.label })),
  };
}

/** Saves a one-tap / batch status change. Resolves only after the server saved it. */
export async function postOrderStatus(orderIds: string[], status: OrderStatus) {
  const res = await fetch('/api/admin/orders/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderIds, status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Could not save');
  return (data.orders as any[]).map(toAdminOrder);
}
