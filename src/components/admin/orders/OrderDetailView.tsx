'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { AdminOrder, OrderStatus, SetOrderStatus } from './types';
import { STATUS, addressLine, copyToClipboard, dateTime, itemCount, money, saveErrorText, waitedSince } from './status';
import { ArrowIcon, BackIcon, CheckIcon, CopyIcon, CopyOrderButton, NavIcon, NoteBox, PhoneIcon, StatusBadge, Timeline, ChatIcon } from './ui';

export type OrderDetailViewProps = {
  order: AdminOrder;
  setStatus: SetOrderStatus;
  saveStaffNote: (orderId: string, note: string) => Promise<void>;
  backHref?: string;
  printHref?: string;
  /** Full editor: print, any status, payment status, test-order flag. */
  moreHref?: string;
  /** Orders still confirmed after this many hours get a "Waiting" warning. */
  staleAfterHours?: number;
};

export default function OrderDetailView({ order, setStatus, saveStaffNote, backHref = '/admin/orders', printHref, moreHref, staleAfterHours = 2 }: OrderDetailViewProps) {
  const [status, setLocalStatus] = useState<OrderStatus>(order.orderStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState(order.staffNotes || '');
  const [noteState, setNoteState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [addrCopied, setAddrCopied] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setLocalStatus(order.orderStatus), [order.orderStatus]);
  useEffect(() => () => {
    if (noteTimer.current) clearTimeout(noteTimer.current);
  }, []);

  const conf = STATUS[status];
  const addr = addressLine(order);
  const ageHours = (Date.now() - new Date(order.createdAt).getTime()) / 3_600_000;
  const stale = (status === 'pending' || status === 'confirmed') && ageHours >= staleAfterHours;
  const customerNote = order.deliveryNotes?.trim();
  const phone = order.customer.phone?.replace(/[^\d+]/g, '');

  async function change(to: OrderStatus) {
    const prev = status;
    setLocalStatus(to);
    setBusy(true);
    setError(null);
    try {
      await setStatus([order._id], to);
    } catch (err) {
      setLocalStatus(prev);
      setError(saveErrorText(err));
    } finally {
      setBusy(false);
    }
  }

  function onNoteChange(v: string) {
    setNote(v);
    setNoteState('saving');
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      try {
        await saveStaffNote(order._id, v);
        setNoteState('saved');
      } catch {
        setNoteState('error');
      }
    }, 800);
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col bg-[#fafafa] pb-32 font-[Jost,system-ui,sans-serif] text-[#0a0a0a]">
      <header className="flex h-14 items-center gap-1 border-b border-[#e4e4e7] bg-white pl-1 pr-3">
        <Link href={backHref} aria-label="Back to orders" className="flex h-11 w-11 items-center justify-center">
          <BackIcon />
        </Link>
        <span className="flex-1 font-mono text-xl font-bold">{order.orderNumber}</span>
        <StatusBadge status={status} />
      </header>

      {status === 'pending' && (
        <div className="flex items-center gap-2.5 bg-[#27272a] px-4 py-3 text-white">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#8fd18f]" />
          <span className="text-[15px] font-semibold">New order · waiting {waitedSince(order.createdAt)}</span>
        </div>
      )}

      <section className="flex flex-col gap-3.5 border-b border-[#e4e4e7] bg-white px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-[#52525b]">Placed {dateTime(order.createdAt)}</span>
          {stale && status !== 'pending' && (
            <span className="rounded-full bg-[#fff1f2] px-2.5 py-0.5 text-xs font-semibold text-[#be123c]">Waiting {waitedSince(order.createdAt)}</span>
          )}
        </div>
        {status !== 'cancelled' && <Timeline status={status} large />}
      </section>

      <div className="flex flex-col gap-3 p-4">
        {error && <p className="rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{error}</p>}

        {customerNote && <NoteBox text={customerNote} large />}

        <CopyOrderButton order={order} full />

        <Card>
          <div className="flex flex-col gap-0.5">
            <span className="text-[17px] font-semibold">{order.customer.name}</span>
            <span className="text-sm text-[#52525b]">
              {order.customer.phone || 'No phone'}
              {order.isAgeVerified ? ' · 21+ verified' : ''}
            </span>
          </div>
          {phone && (
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${phone}`} className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#d4d4d8] text-sm font-semibold">
                <PhoneIcon /> Call
              </a>
              <a href={`sms:${phone}`} className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#d4d4d8] text-sm font-semibold">
                <ChatIcon className="stroke-current" /> Text
              </a>
            </div>
          )}
        </Card>

        {order.fulfillment === 'delivery' && addr && (
          <Card>
            <div className="flex flex-col gap-0.5">
              <Label>DELIVER TO</Label>
              <span className="text-[17px] font-semibold leading-snug">{addr}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] bg-[#1d4ed8] text-sm font-semibold text-white"
              >
                <NavIcon /> Navigate
              </a>
              <button
                type="button"
                onClick={async () => {
                  if (await copyToClipboard(addr)) {
                    setAddrCopied(true);
                    setTimeout(() => setAddrCopied(false), 2500);
                  }
                }}
                className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#d4d4d8] bg-white text-sm font-semibold"
              >
                {addrCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                {addrCopied ? 'Copied' : 'Copy address'}
              </button>
            </div>
          </Card>
        )}

        <Card>
          <Label>ITEMS ({itemCount(order)})</Label>
          {order.items.map((i, k) => (
            <div key={k} className="flex items-start gap-3">
              <span className="min-w-6 text-[15px] font-bold text-[#4c6e4d]">{i.quantity}×</span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold leading-snug">{i.name}</span>
                <span className="text-[13px] text-[#52525b]">{[i.category, i.weight].filter(Boolean).join(' · ')}</span>
              </div>
              <span className="text-[15px] font-semibold">{money(i.price * i.quantity)}</span>
            </div>
          ))}
        </Card>

        <Card>
          <Label>{order.fulfillment === 'pickup' ? 'CASH ON PICKUP' : 'CASH ON DELIVERY'}</Label>
          <Row label="Subtotal" value={money(order.subtotal ?? order.total)} />
          {!!order.discountAmount && (
            <Row label={order.couponCode ? `Deals & coupon (${order.couponCode})` : 'Deals'} value={`-${money(order.discountAmount)}`} />
          )}
          {order.fulfillment === 'delivery' && (
            <Row
              label="Delivery"
              value={order.deliveryFee ? money(order.deliveryFee) : <span className="font-semibold text-[#1f6b33]">Free</span>}
            />
          )}
          <Row label="Change needed" value={order.changeFor ? `For $${order.changeFor}` : 'None'} />
          <div className="flex items-baseline justify-between border-t border-[#f0f0f2] pt-2">
            <span className="text-base font-semibold">{order.paymentStatus === 'paid' ? 'Collected' : 'Collect'}</span>
            <span className="text-2xl font-bold">{money(order.total)}</span>
          </div>
        </Card>

        <Card>
          <label htmlFor="staff-note">
            <Label>STAFF NOTE</Label>
          </label>
          <textarea
            id="staff-note"
            rows={2}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Driver, packing remarks…"
            className="w-full resize-none rounded-[10px] border border-[#e4e4e7] px-3 py-2.5 text-[15px]"
          />
          <span className="text-xs text-[#52525b]">
            {noteState === 'saving' ? 'Saving…' : noteState === 'saved' ? 'Saved' : noteState === 'error' ? "Couldn't save note" : 'Saves automatically'}
          </span>
        </Card>

        {!!order.history?.length && (
          <Card>
            <Label>HISTORY</Label>
            {[...order.history].reverse().map((h, k) => (
              <div key={k} className="flex justify-between gap-3 text-sm">
                <span>{h.label}</span>
                <span className="shrink-0 text-[#52525b]">{dateTime(h.at)}</span>
              </div>
            ))}
          </Card>
        )}

        {(printHref || moreHref) && (
          <div className="flex flex-wrap justify-center gap-x-6">
            {printHref && (
              <a href={printHref} className="flex h-11 items-center justify-center text-sm font-medium text-[#3f3f46]">
                Print slip
              </a>
            )}
            {moreHref && (
              <Link href={moreHref} className="flex h-11 items-center justify-center text-sm font-medium text-[#3f3f46]">
                Full details &amp; edit
              </Link>
            )}
          </div>
        )}
      </div>

      {(conf.next || status === 'pending') && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t md:left-64 border-[#e4e4e7] bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-5 pt-3">
            {status === 'pending' ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Decline ${order.orderNumber}? It will be marked Cancelled.`)) change('cancelled');
                }}
                className="h-[52px] rounded-xl border border-[#d4d4d8] bg-white px-4 text-[15px] font-semibold text-[#3f3f46]"
              >
                Decline
              </button>
            ) : (
              <div className="flex flex-col">
                <span className="text-xs text-[#52525b]">Cash due</span>
                <span className="text-xl font-bold">{money(order.total)}</span>
              </div>
            )}
            {conf.next && (
              <button
                type="button"
                disabled={busy}
                onClick={() => change(conf.next!)}
                className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl text-base font-semibold disabled:opacity-60 ${conf.actionClass}`}
              >
                {status === 'confirmed' ? 'Send out for delivery' : conf.actionLabel}
                <ArrowIcon size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-3 rounded-xl border border-[#e4e4e7] bg-white p-3.5">{children}</section>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold tracking-wide text-[#52525b]">{children}</span>;
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-[15px]">
      <span className="text-[#3f3f46]">{label}</span>
      <span>{value}</span>
    </div>
  );
}
