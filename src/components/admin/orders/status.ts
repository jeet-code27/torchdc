import type { AdminOrder, OrderStatus } from './types';

/** GG1 palette: grey while in the shop, sage once it's moving, dark sage when done. */
export const STATUS: Record<
  OrderStatus,
  { label: string; badge: string; next?: OrderStatus; actionLabel?: string; bulkLabel?: string; actionClass?: string }
> = {
  pending: {
    label: 'Pending',
    badge: 'bg-[#f4f4f5] text-[#52525b] border border-[#e4e4e7]',
    next: 'confirmed',
    actionLabel: 'Confirm order',
    bulkLabel: 'Confirm',
    actionClass: 'bg-[#71717a] text-white',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-[#e4e4e7] text-[#3f3f46]',
    next: 'out_for_delivery',
    actionLabel: 'Send out',
    bulkLabel: 'Send out',
    actionClass: 'bg-[#4f7a52] text-white',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    badge: 'bg-[#dfeadb] text-[#3f5e3c]',
    next: 'completed',
    actionLabel: 'Delivered & paid',
    bulkLabel: 'Mark delivered & paid',
    actionClass: 'bg-[#2a4a2d] text-white',
  },
  completed: { label: 'Completed', badge: 'bg-[#3f6b40] text-white' },
  cancelled: { label: 'Cancelled', badge: 'bg-[#f4f4f5] text-[#71717a] line-through' },
};

export const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'out_for_delivery', label: 'Out' },
  { status: 'completed', label: 'Delivered' },
];

export const ACCENT = '#4c6e4d';

export function timelineIndex(status: OrderStatus) {
  return TIMELINE.findIndex((t) => t.status === status);
}

export const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;

export function itemCount(order: AdminOrder) {
  return order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
}

export function addressLine(order: AdminOrder) {
  const a = order.deliveryAddress;
  if (!a || !a.street) return order.fulfillment === 'pickup' ? 'Store pickup' : '';
  const street = [a.street, a.apartment ? `Apt ${a.apartment}` : ''].filter(Boolean).join(', ');
  const tail = [a.city, [a.state, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  // Some customers type the full address into "street"; don't repeat city/zip in that case.
  return a.zip && street.includes(a.zip) ? street : [street, tail].filter(Boolean).join(', ');
}

/** "4 min", "3 hr", "2 days" since a date. */
export function waitedSince(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
}

export function dateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });
}

/** Text placed on the clipboard by the copy buttons. */
export function buildCopyText(order: AdminOrder) {
  const lines = [
    order.customer.name,
    order.customer.phone || '',
    addressLine(order),
    ...order.items.map((i) => `${i.quantity}x ${i.name}${i.weight ? ` (${i.weight})` : ''}`),
    `Collect: ${money(order.total)} cash`,
  ];
  if (order.changeFor) lines.push(`Needs change for $${order.changeFor}`);
  if (order.deliveryNotes) lines.push(`Note: ${order.deliveryNotes}`);
  return lines.filter(Boolean).join('\n');
}

/** Message for a failed save: the server's reason when it gave one (e.g. "changed by someone else"). */
export function saveErrorText(err: unknown) {
  const msg = err instanceof Error ? err.message : '';
  return msg && !/fetch|network|load failed/i.test(msg) ? msg : "Couldn't save. Check your connection and try again.";
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
