import type { OrderForAlert } from '@/lib/push/order-alerts';

/**
 * New-order email TEMPLATE (owner-approved, design board "E. Email alert").
 * Email sending is already set up in the project: keep that sender and swap in this content.
 *
 *   const { subject, html, text } = buildOrderEmail(order, 'new', process.env.ADMIN_BASE_URL);
 *   await existingSendEmail({ to, subject, html, text });
 *
 * Use kind 'reminder' for the 5-minute "Still waiting" email.
 * No product names, same as push alerts (keeps lock screens / shared inboxes discreet).
 */

const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function timeNY(iso?: string | Date) {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
}

function facts(order: OrderForAlert) {
  const firstName = (order.customer?.name || 'Customer').trim().split(/\s+/)[0];
  const count = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
  const where = order.fulfillment === 'pickup' ? 'Pickup' : order.deliveryAddress?.zip || 'See order';
  return { firstName, count, where };
}

function row(label: string, value: string, big = false) {
  return `<tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f2;color:#52525b;font-size:15px">${label}</td><td align="right" style="padding:12px 0;border-bottom:1px solid #f0f0f2;font-weight:${big ? 700 : 600};font-size:${big ? 22 : 15}px;color:#0a0a0a">${value}</td></tr>`;
}

function html(order: OrderForAlert, url: string, reminder: boolean) {
  const { firstName, count, where } = facts(order);
  const note = order.deliveryNotes?.trim();
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Jost,Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:16px 0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden">
<tr><td style="background:#3f6b40;padding:18px 20px"><span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:.02em">TORCH</span><span style="float:right;font-size:13px;font-weight:600;color:#dfeadb;line-height:24px">${reminder ? 'Still waiting' : 'New order'}</span></td></tr>
<tr><td style="padding:22px 20px 6px"><div style="font-family:Menlo,Consolas,monospace;font-size:26px;font-weight:700;color:#0a0a0a">${esc(order.orderNumber)}</div>
<div style="font-size:14px;color:#52525b;padding-top:4px">${reminder ? 'Placed 5+ min ago · not confirmed yet' : `Placed today at ${timeNY(order.createdAt)} · waiting for confirmation`}</div></td></tr>
<tr><td style="padding:8px 20px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row('Customer', esc(firstName))}${row('Items', `${count} item${count === 1 ? '' : 's'}`)}${row(order.fulfillment === 'pickup' ? 'Fulfillment' : 'Delivery to', esc(where))}${row('Cash to collect', money(order.total), true)}
</table></td></tr>
${note ? `<tr><td style="padding:10px 20px 0"><div style="background:#fff8e6;border:1px solid #f3d9a4;border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.4;color:#3f3f46"><strong style="color:#9a3f06">Note:</strong> ${esc(note)}</div></td></tr>` : ''}
<tr><td style="padding:20px"><a href="${esc(url)}" style="display:block;text-align:center;background:#3f6b40;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;line-height:52px;border-radius:12px">Open order to confirm</a></td></tr>
<tr><td style="padding:0 20px 20px;font-size:12px;line-height:1.5;color:#71717a">You get this because this address receives Torch new order alerts.</td></tr>
</table></td></tr></table></body></html>`;
}

function text(order: OrderForAlert, url: string, reminder: boolean) {
  const { firstName, count, where } = facts(order);
  return [
    reminder ? `Still waiting: ${order.orderNumber} not confirmed` : `New order ${order.orderNumber}`,
    `Customer: ${firstName}`,
    `Items: ${count}`,
    `${order.fulfillment === 'pickup' ? 'Fulfillment' : 'Delivery to'}: ${where}`,
    `Cash to collect: ${money(order.total)}`,
    order.deliveryNotes?.trim() ? `Note: ${order.deliveryNotes.trim()}` : '',
    `Open order to confirm: ${url}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function buildOrderEmail(order: OrderForAlert, kind: 'new' | 'reminder', adminBaseUrl = '') {
  const url = `${adminBaseUrl.replace(/\/$/, '')}/admin/orders/${String(order._id)}`;
  const reminder = kind === 'reminder';
  const subject = reminder ? `Still waiting: ${order.orderNumber} not confirmed` : `New order ${order.orderNumber} · ${money(order.total)}`;
  return { subject, html: html(order, url, reminder), text: text(order, url, reminder) };
}
