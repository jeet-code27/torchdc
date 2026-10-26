'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminOrder, OrderStatus, SetOrderStatus } from './types';
import { STATUS, displayOrderNumber, isFinal, itemCount, money, saveErrorText, shortDate, waitedSince } from './status';
import { ArrowIcon, CheckIcon, ClockIcon, CopyOrderButton, NewTag, NoteBox, SearchIcon, StatusBadge, Timeline, TruckIcon } from './ui';

/** Three big filter tiles (owner-approved). "Confirmed" also holds orders out for delivery. */
export type OrdersFilter = 'pending' | 'confirmed' | 'done';

const FILTERS: { key: OrdersFilter; label: string; statuses: OrderStatus[] }[] = [
  { key: 'pending', label: 'New', statuses: ['pending'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['confirmed', 'out_for_delivery'] },
  { key: 'done', label: 'Done', statuses: ['completed', 'cancelled'] },
];

/** Done shows today's orders (America/New_York) unless "Show older" is tapped. */
const nyDay = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const finishedAt = (o: AdminOrder) => o.history?.length ? o.history[o.history.length - 1].at : o.createdAt;

type Toast = { text: string; prev: Record<string, OrderStatus> } | null;

export type OrdersListProps = {
  orders: AdminOrder[]; // test orders already filtered out
  setStatus: SetOrderStatus;
  abandonedCount?: number;
  abandonedHref?: string;
  detailHref?: (id: string) => string;
  /** From `?filter=` (or legacy `?status=`) so Dashboard links land on the right tile. */
  initialFilter?: OrdersFilter;
};

export default function OrdersList({
  orders,
  setStatus,
  abandonedCount = 0,
  abandonedHref = '/admin/orders/abandoned',
  detailHref = (id) => `/admin/orders/${id}`,
  initialFilter = 'pending',
}: OrdersListProps) {
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({});
  const [filter, setFilter] = useState<OrdersFilter>(initialFilter);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOlder, setShowOlder] = useState(false);
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [error, setError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const live = useMemo(() => orders.map((o) => (overrides[o._id] ? { ...o, orderStatus: overrides[o._id] } : o)), [orders, overrides]);
  const statusesOf = (f: OrdersFilter) => FILTERS.find((x) => x.key === f)!.statuses;
  const countFor = (f: OrdersFilter) => live.filter((o) => statusesOf(f).includes(o.orderStatus)).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    const allowed = statusesOf(filter);
    return live
      .filter((o) => (q ? true : allowed.includes(o.orderStatus))) // searching looks across every status
      .filter((o) => q || filter !== 'done' || showOlder || nyDay(finishedAt(o)) === nyDay(new Date().toISOString()))
      .filter((o) =>
        !q ? true : [o.orderNumber.replace(/^#/, ''), o.customer.name, o.customer.phone || ''].some((v) => v.toLowerCase().includes(q))
      )
      .map((o, i) => ({ o, i }))
      .sort((a, b) => Number(b.o.orderStatus === 'pending') - Number(a.o.orderStatus === 'pending') || a.i - b.i)
      .map((x) => x.o);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, filter, query, showOlder]);

  const cashToCollect = live.filter((o) => !isFinal(o.orderStatus) && o.paymentStatus !== 'paid').reduce((s, o) => s + o.total, 0);

  async function apply(ids: string[], to: OrderStatus, text: string) {
    if (!ids.length) return;
    const prev: Record<string, OrderStatus> = {};
    for (const id of ids) prev[id] = live.find((o) => o._id === id)!.orderStatus;
    setOverrides((cur) => ({ ...cur, ...Object.fromEntries(ids.map((id) => [id, to])) }));
    setError(null);
    try {
      await setStatus(ids, to);
      setSelected((cur) => new Set([...cur].filter((id) => !ids.includes(id))));
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ text, prev });
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setOverrides((cur) => ({ ...cur, ...prev }));
      setError(saveErrorText(err));
    }
  }

  async function undo() {
    if (!toast) return;
    const { prev } = toast;
    setToast(null);
    setOverrides((cur) => ({ ...cur, ...prev }));
    try {
      const byStatus = new Map<OrderStatus, string[]>();
      for (const [id, s] of Object.entries(prev)) byStatus.set(s, [...(byStatus.get(s) || []), id]);
      for (const [status, group] of byStatus) await setStatus(group, status);
    } catch {
      setError("Couldn't undo. Open the order to fix its status.");
    }
  }

  const selectedOrders = live.filter((o) => selected.has(o._id));
  const selIds = selectedOrders.map((o) => o._id);
  const n = selIds.length;
  const plural = (k: number) => `${k} order${k === 1 ? '' : 's'}`;
  const advance = (['pending', 'confirmed'] as OrderStatus[])
    .map((from) => {
      const ids = selectedOrders.filter((o) => o.orderStatus === from).map((o) => o._id);
      return ids.length ? { from, to: STATUS[from].next!, ids } : null;
    })
    .filter(Boolean) as { from: OrderStatus; to: OrderStatus; ids: string[] }[];

  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const barOpen = selecting && n > 0;

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col px-4 pb-44 font-[Jost,system-ui,sans-serif] text-[#0a0a0a]">
      <div className="flex items-center gap-2 pt-5">
        <h1 className="m-0 flex-1 text-[28px] font-bold">Orders</h1>
        <button
          type="button"
          aria-label="Search orders"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#e4e4e7] bg-white"
        >
          <SearchIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => {
            setSelecting((s) => !s);
            setSelected(new Set());
          }}
          className={`h-11 rounded-[10px] px-4 text-sm font-semibold ${selecting ? 'bg-[#0a0a0a] text-white' : 'border border-[#d4d4d8] bg-white'}`}
        >
          {selecting ? 'Done' : 'Select'}
        </button>
      </div>

      {searchOpen && (
        <label className="mt-3 flex h-11 items-center rounded-[10px] border border-[#d4d4d8] px-3">
          <span className="sr-only">Search orders</span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order #, name or phone"
            className="w-full border-0 bg-transparent text-[15px] outline-none"
          />
        </label>
      )}

      <nav aria-label="Filter orders" className="grid grid-cols-3 gap-2.5 pt-4">
        {FILTERS.map((f) => {
          const on = f.key === filter && !query;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setFilter(f.key);
                setQuery('');
                setShowOlder(false);
                setSelected(new Set());
              }}
              className={`flex h-[72px] min-w-0 flex-col items-center justify-center gap-1 rounded-[14px] px-0.5 ${
                on ? 'border border-[#3f6b40] bg-[#3f6b40] text-white' : 'border border-[#d4d4d8] bg-white'
              }`}
            >
              <span className="text-2xl font-bold leading-none">{countFor(f.key)}</span>
              <span className="truncate text-sm font-semibold leading-tight">{f.label}</span>
            </button>
          );
        })}
      </nav>

      {selecting ? (
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm font-semibold">{n} selected</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSelected(new Set(visible.filter((o) => !isFinal(o.orderStatus)).map((o) => o._id)))}
              className="h-9 px-2.5 text-sm font-semibold text-[#3f6b40]"
            >
              Select all
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="h-9 px-2.5 text-sm font-medium text-[#52525b]">
              Clear
            </button>
          </div>
        </div>
      ) : (
        <p className="m-0 pt-2.5 text-[13px] text-[#52525b]">
          {query ? `${plural(visible.length)} matching “${query}”` : plural(visible.length)}
          {!query && filter === 'confirmed' && cashToCollect > 0 ? ` · ${money(cashToCollect)} cash to collect` : ''}
          {!query && filter === 'done' && !showOlder ? ' today' : ''}
        </p>
      )}

      {error && <p className="mt-3 rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{error}</p>}

      <div className="flex flex-col gap-3 pt-3">
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#d4d4d8] px-4 py-8 text-center">
            <span className="text-base font-semibold">
              {query
                ? 'No orders match your search'
                : filter === 'done' && !showOlder
                  ? 'Nothing finished today yet'
                  : `No ${FILTERS.find((f) => f.key === filter)!.label.toLowerCase()} orders right now`}
            </span>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('pending');
              }}
              className="h-11 rounded-[10px] border border-[#d4d4d8] bg-white px-4 text-sm font-semibold"
            >
              Show new orders
            </button>
          </div>
        )}
        {visible.map((o) => (
          <OrderCard
            key={o._id}
            order={o}
            href={detailHref(o._id)}
            selecting={selecting}
            selected={selected.has(o._id)}
            onToggle={() => toggle(o._id)}
            onAdvance={() => {
              const next = STATUS[o.orderStatus].next;
              if (next) apply([o._id], next, `${displayOrderNumber(o.orderNumber)} set to ${STATUS[next].label}`);
            }}
          />
        ))}
      </div>

      {filter === 'done' && !query && !showOlder && live.some((o) => isFinal(o.orderStatus)) && (
        <button
          type="button"
          onClick={() => setShowOlder(true)}
          className="mt-3 h-11 rounded-[10px] border border-[#d4d4d8] bg-white text-sm font-semibold"
        >
          Show older
        </button>
      )}

      <Link href={abandonedHref} className="mt-4 flex min-h-14 items-center justify-between rounded-xl border border-[#e4e4e7] px-3.5">
        <span className="text-[15px] font-medium">Abandoned carts</span>
        <span className="text-sm text-[#52525b]">{abandonedCount} ›</span>
      </Link>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 z-40 mx-auto flex max-w-3xl md:left-[17rem] items-center justify-between gap-2 rounded-xl bg-[#18181b] py-2 pl-4 pr-2 text-sm text-white"
          style={{ bottom: barOpen ? 96 + (advance.length + 1) * 56 : 24 }}
        >
          <span>{toast.text}</span>
          <button type="button" onClick={undo} className="h-11 px-3.5 font-semibold text-[#a7d1a8]">
            Undo
          </button>
        </div>
      )}

      {barOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t md:left-64 border-[#e4e4e7] bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 pb-5 pt-3">
            {advance.map((a) => (
              <button
                key={a.from}
                type="button"
                onClick={() => apply(a.ids, a.to, `${plural(a.ids.length)} set to ${STATUS[a.to].label}`)}
                className={`h-12 rounded-[10px] text-[15px] font-semibold ${STATUS[a.from].actionClass}`}
              >
                {STATUS[a.from].bulkLabel} ({a.ids.length})
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => apply(selIds, 'completed', `${plural(n)} completed & paid`)}
                className="h-12 rounded-[10px] bg-[#2a4a2d] text-[15px] font-semibold text-white"
              >
                Complete ({n})
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="h-12 rounded-[10px] border border-[#f5c2c7] bg-white text-[15px] font-semibold text-[#be123c]"
              >
                Cancel ({n})
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:left-64" onClick={() => setConfirmCancel(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Cancel ${plural(n)}`}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-t-[18px] bg-white px-4 pb-6 pt-5"
          >
            <h2 className="m-0 text-lg font-bold">Cancel {plural(n)}?</h2>
            <p className="m-0 text-sm leading-snug text-[#3f3f46]">They&apos;ll be marked Cancelled and moved to Done. You can undo for 5 seconds.</p>
            <button
              type="button"
              onClick={async () => {
                setConfirmCancel(false);
                await apply(selIds, 'cancelled', `${plural(n)} cancelled`);
              }}
              className="h-12 rounded-[10px] bg-[#be123c] text-[15px] font-semibold text-white"
            >
              Cancel {plural(n)}
            </button>
            <button type="button" onClick={() => setConfirmCancel(false)} className="h-11 text-[15px] font-semibold text-[#3f3f46]">
              Keep orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order: o,
  href,
  selecting,
  selected,
  onToggle,
  onAdvance,
}: {
  order: AdminOrder;
  href: string;
  selecting: boolean;
  selected: boolean;
  onToggle: () => void;
  onAdvance: () => void;
}) {
  const conf = STATUS[o.orderStatus];
  const isNew = o.orderStatus === 'pending';
  const final = isFinal(o.orderStatus);
  const paid = o.paymentStatus === 'paid';
  const n = itemCount(o);
  const note = [o.changeFor ? `Needs change for $${o.changeFor}` : '', o.deliveryNotes || ''].filter(Boolean).join(' · ');
  const selectable = selecting && !final;

  return (
    <article
      onClick={selectable ? onToggle : undefined}
      className={`flex flex-col gap-2.5 rounded-xl p-3.5 ${selectable ? 'cursor-pointer' : ''} ${selecting && final ? 'opacity-50' : ''} ${
        selecting && selected
          ? 'border-2 border-[#3f6b40] bg-[#f5f9f5]'
          : isNew
            ? 'border-2 border-[#3f3f46] bg-[#fafafa]'
            : 'm-px border border-[#e4e4e7]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {selecting && (
            <button
              type="button"
              disabled={final}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label={`Select ${displayOrderNumber(o.orderNumber)}`}
              aria-pressed={selected}
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-2 ${
                selected ? 'border-[#3f6b40] bg-[#3f6b40] text-white' : final ? 'border-[#e4e4e7] bg-[#f4f4f5]' : 'border-[#a1a1aa] bg-white'
              }`}
            >
              {selected && <CheckIcon size={16} />}
            </button>
          )}
          <span className="font-mono text-[17px] font-bold">{displayOrderNumber(o.orderNumber)}</span>
          {isNew && <NewTag />}
        </div>
        <StatusBadge status={o.orderStatus} />
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-base font-semibold">{o.customer.name}</span>
          {o.customer.phone && <span className="text-[13px] text-[#52525b]">{o.customer.phone}</span>}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-xl font-bold ${o.orderStatus === 'cancelled' ? 'text-[#a1a1aa] line-through' : ''}`}>{money(o.total)}</span>
          {o.orderStatus !== 'cancelled' && (
            <span className={`text-xs font-medium ${paid ? 'text-[#1f6b33]' : 'text-[#9a3f06]'}`}>{paid ? 'Cash collected' : 'Cash due'}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[13px] text-[#52525b]">
        <TruckIcon className="text-[#3f3f46]" />
        <span className="font-medium text-[#3f3f46]">{o.fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</span>
        <span>·</span>
        <span>
          {n} item{n === 1 ? '' : 's'}
        </span>
        <span>·</span>
        <span>{shortDate(o.createdAt)}</span>
      </div>

      {isNew && (
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3f3f46]">
          <ClockIcon />
          <span>Waiting {waitedSince(o.createdAt)} for confirmation</span>
        </div>
      )}

      {note && !selecting && <NoteBox text={note} />}

      {!selecting && o.orderStatus !== 'cancelled' && (
        <div className="pt-1">
          <Timeline status={o.orderStatus} />
        </div>
      )}

      {!selecting && (
        <div className="flex gap-2 border-t border-[#f0f0f2] pt-2.5">
          <CopyOrderButton order={o} />
          <Link href={href} className="flex h-11 flex-1 items-center justify-center rounded-[10px] border border-[#e4e4e7] text-sm font-medium">
            Details
          </Link>
          {conf.next ? (
            <button
              type="button"
              onClick={onAdvance}
              className={`flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-[10px] text-sm font-semibold ${conf.actionClass}`}
            >
              {conf.actionLabel}
              <ArrowIcon />
            </button>
          ) : (
            <div className="flex h-11 flex-[2] items-center justify-center gap-1.5 rounded-[10px] bg-[#f4f4f5] text-sm font-medium text-[#52525b]">
              {o.orderStatus === 'completed' ? (
                <>
                  <CheckIcon size={16} /> Delivered &amp; paid
                </>
              ) : (
                'Cancelled'
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
