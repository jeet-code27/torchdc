'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminOrder, OrderStatus, SetOrderStatus } from './types';
import { STATUS, itemCount, money, saveErrorText, shortDate, waitedSince } from './status';
import { ArrowIcon, CheckIcon, ClockIcon, CopyOrderButton, NewTag, NoteBox, SearchIcon, StatusBadge, Timeline, TruckIcon } from './ui';

type Tab = 'all' | 'delivery' | 'pickup' | 'abandoned';
type Toast = { text: string; undo: { ids: string[]; prev: Record<string, OrderStatus> } } | null;

export type OrdersListProps = {
  orders: AdminOrder[];
  setStatus: SetOrderStatus;
  abandonedCount?: number;
  /** Rendered when the Abandoned tab is selected (keep the existing abandoned-carts view). */
  abandonedView?: React.ReactNode;
  detailHref?: (id: string) => string;
  /** Pre-select a status filter, e.g. from `?status=pending` (Dashboard links use this). */
  initialStatus?: OrderStatus | 'all';
};

const ADVANCEABLE: OrderStatus[] = ['pending', 'confirmed', 'out_for_delivery'];

export default function OrdersList({
  orders,
  setStatus,
  abandonedCount = 0,
  abandonedView,
  detailHref = (id) => `/admin/orders/${id}`,
  initialStatus = 'all',
}: OrdersListProps) {
  // Optimistic status overrides so taps feel instant; rolled back if the save fails.
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({});
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(initialStatus);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast>(null);
  const [error, setError] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const live = useMemo(() => orders.map((o) => (overrides[o._id] ? { ...o, orderStatus: overrides[o._id] } : o)), [orders, overrides]);

  const counts = useMemo(() => {
    const delivery = live.filter((o) => o.fulfillment === 'delivery').length;
    return {
      total: live.length,
      toFulfill: live.filter((o) => ADVANCEABLE.includes(o.orderStatus)).length,
      delivery,
      pickup: live.length - delivery,
      pending: live.filter((o) => o.orderStatus === 'pending').length,
    };
  }, [live]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    return live
      .filter((o) => (tab === 'delivery' || tab === 'pickup' ? o.fulfillment === tab : true))
      .filter((o) => (statusFilter === 'all' ? true : o.orderStatus === statusFilter))
      .filter((o) =>
        !q
          ? true
          : [o.orderNumber.replace(/^#/, ''), o.customer.name, o.customer.phone || ''].some((v) => v.toLowerCase().includes(q))
      )
      .map((o, i) => ({ o, i }))
      .sort((a, b) => Number(b.o.orderStatus === 'pending') - Number(a.o.orderStatus === 'pending') || a.i - b.i)
      .map((x) => x.o);
  }, [live, tab, statusFilter, query]);

  async function apply(ids: string[], to: OrderStatus, text: string) {
    const prev: Record<string, OrderStatus> = {};
    for (const id of ids) prev[id] = live.find((o) => o._id === id)!.orderStatus;
    setOverrides((cur) => ({ ...cur, ...Object.fromEntries(ids.map((id) => [id, to])) }));
    setError(null);
    try {
      await setStatus(ids, to);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ text, undo: { ids, prev } });
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    } catch (err) {
      setOverrides((cur) => ({ ...cur, ...prev }));
      setError(saveErrorText(err));
    }
  }

  async function undo() {
    if (!toast) return;
    const { ids, prev } = toast.undo;
    setToast(null);
    setOverrides((cur) => ({ ...cur, ...prev }));
    try {
      // Group by previous status so each call is a single status.
      const byStatus = new Map<OrderStatus, string[]>();
      for (const id of ids) byStatus.set(prev[id], [...(byStatus.get(prev[id]) || []), id]);
      for (const [status, group] of byStatus) await setStatus(group, status);
    } catch {
      setError("Couldn't undo. Open the order to fix its status.");
    }
  }

  const selectedOrders = live.filter((o) => selected.has(o._id));
  const bulkActions = ADVANCEABLE.map((from) => {
    const hits = selectedOrders.filter((o) => o.orderStatus === from).map((o) => o._id);
    const conf = STATUS[from];
    return hits.length ? { from, to: conf.next!, ids: hits, label: `${conf.bulkLabel} (${hits.length})`, cls: conf.actionClass! } : null;
  }).filter(Boolean) as { from: OrderStatus; to: OrderStatus; ids: string[]; label: string; cls: string }[];

  const toggleSelect = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `All Orders (${counts.total})` },
    { key: 'delivery', label: `DC Delivery (${counts.delivery})` },
    { key: 'pickup', label: `Store Pickups (${counts.pickup})` },
    { key: 'abandoned', label: `Abandoned (${abandonedCount})` },
  ];

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col pb-40 font-[Jost,system-ui,sans-serif] text-[#0a0a0a]">
      {counts.pending > 0 && (
        <div role="status" className="mx-4 mt-3 flex items-center gap-2.5 rounded-xl bg-[#27272a] py-2.5 pl-3.5 pr-2.5 text-white">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#8fd18f]" />
          <span className="flex-1 text-[15px] font-semibold">
            {counts.pending} new order{counts.pending === 1 ? '' : 's'} waiting
          </span>
          <button
            type="button"
            onClick={() => {
              setTab('all');
              setStatusFilter('pending');
            }}
            className="h-10 rounded-lg bg-white px-3.5 text-sm font-semibold text-[#0a0a0a]"
          >
            Review
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1 px-4 pt-5">
        <h1 className="m-0 text-[26px] font-bold leading-tight">Orders &amp; Live Carts</h1>
        <p className="m-0 text-sm text-[#52525b]">Deliveries, pickups and abandoned carts.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-4 pt-4 sm:grid-cols-4">
        <Stat label="Total Orders" value={String(counts.total)} />
        <Stat label="To Fulfill" value={String(counts.toFulfill)} valueClass="text-[#b4530a]" />
        <Stat label="Delivery / Pickup" value={`${counts.delivery} / ${counts.pickup}`} />
        <Stat label="Abandoned Carts" value={String(abandonedCount)} valueClass="text-[#be123c]" />
      </div>

      <nav aria-label="Order views" className="grid grid-cols-2 gap-2 px-4 pt-4 sm:grid-cols-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`h-11 rounded-[10px] text-sm ${tab === t.key ? 'bg-[#4c6e4d] font-semibold text-white' : 'border border-[#e4e4e7] font-medium'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'abandoned' ? (
        <div className="px-4 pt-4">{abandonedView}</div>
      ) : (
        <>
          <div className="flex gap-2 px-4 pt-4">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#e4e4e7] px-3">
              <SearchIcon />
              <span className="sr-only">Search orders</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order #, name, phone"
                className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
              />
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="h-11 rounded-[10px] border border-[#e4e4e7] bg-white px-2.5 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between px-4 pt-5">
            <h2 className="m-0 text-lg font-bold">Live orders</h2>
            <button
              type="button"
              onClick={() => {
                setSelecting((s) => !s);
                setSelected(new Set());
              }}
              className={`h-10 rounded-[10px] px-4 text-sm font-semibold ${selecting ? 'bg-[#0a0a0a] text-white' : 'border border-[#d4d4d8] bg-white'}`}
            >
              {selecting ? 'Done' : 'Select'}
            </button>
          </div>

          {selecting && (
            <div className="flex flex-wrap gap-2 px-4 pt-2.5">
              {ADVANCEABLE.map((s) => {
                const n = live.filter((o) => o.orderStatus === s).length;
                if (!n) return null;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelected(new Set(live.filter((o) => o.orderStatus === s).map((o) => o._id)))}
                    className="h-9 rounded-full border border-[#d4d4d8] bg-white px-3 text-[13px] font-medium"
                  >
                    All {STATUS[s].label.toLowerCase()} ({n})
                  </button>
                );
              })}
              <button type="button" onClick={() => setSelected(new Set())} className="h-9 px-3 text-[13px] font-medium text-[#52525b] underline">
                Clear
              </button>
            </div>
          )}

          {error && <p className="mx-4 mt-3 rounded-lg bg-[#fff1f2] px-3 py-2 text-sm text-[#be123c]">{error}</p>}

          <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
            {visible.length === 0 && <p className="py-10 text-center text-sm text-[#52525b]">No orders match.</p>}
            {visible.map((o) => (
              <OrderCard
                key={o._id}
                order={o}
                href={detailHref(o._id)}
                selecting={selecting}
                selected={selected.has(o._id)}
                onToggle={() => toggleSelect(o._id)}
                onAdvance={() => {
                  const next = STATUS[o.orderStatus].next;
                  if (next) apply([o._id], next, `${o.orderNumber} set to ${STATUS[next].label}`);
                }}
              />
            ))}
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 z-40 mx-auto flex max-w-3xl md:left-[17rem] items-center justify-between gap-2 rounded-xl bg-[#18181b] py-2 pl-4 pr-2 text-sm text-white"
          style={{ bottom: selecting && bulkActions.length ? 96 + bulkActions.length * 56 : 24 }}
        >
          <span>{toast.text}</span>
          <button type="button" onClick={undo} className="h-11 px-3.5 font-semibold text-[#a7d1a8]">
            Undo
          </button>
        </div>
      )}

      {selecting && selectedOrders.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col md:left-64 gap-2.5 border-t border-[#e4e4e7] bg-white px-4 pb-5 pt-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
          <div className="mx-auto w-full max-w-3xl text-sm font-semibold">
            {selectedOrders.length} order{selectedOrders.length === 1 ? '' : 's'} selected
          </div>
          {bulkActions.map((b) => (
            <button
              key={b.from}
              type="button"
              onClick={async () => {
                await apply(b.ids, b.to, `${b.ids.length} order${b.ids.length === 1 ? '' : 's'} set to ${STATUS[b.to].label}`);
                setSelected((cur) => new Set([...cur].filter((id) => !b.ids.includes(id))));
              }}
              className={`mx-auto h-12 w-full max-w-3xl rounded-[10px] text-[15px] font-semibold ${b.cls}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] p-3">
      <div className="text-xs text-[#52525b]">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold ${valueClass}`}>{value}</div>
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
  const paid = o.paymentStatus === 'paid';
  const n = itemCount(o);
  const note = [o.changeFor ? `Needs change for $${o.changeFor}` : '', o.deliveryNotes || ''].filter(Boolean).join(' · ');

  return (
    <article
      className={`flex flex-col gap-2.5 rounded-xl p-3.5 ${
        selecting && selected
          ? 'border-2 border-[#4c6e4d] bg-[#f5f9f5]'
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
              onClick={onToggle}
              aria-label={`Select ${o.orderNumber}`}
              aria-pressed={selected}
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-2 ${
                selected ? 'border-[#4c6e4d] bg-[#4c6e4d] text-white' : 'border-[#a1a1aa] bg-white'
              }`}
            >
              {selected && <CheckIcon size={16} />}
            </button>
          )}
          <span className="font-mono text-[17px] font-bold">{o.orderNumber}</span>
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
          <span className="text-xl font-bold">{money(o.total)}</span>
          <span className={`text-xs font-medium ${paid ? 'text-[#1f6b33]' : 'text-[#9a3f06]'}`}>{paid ? 'Cash collected' : 'Cash due'}</span>
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

      {note && <NoteBox text={note} />}

      {o.orderStatus !== 'cancelled' && (
        <div className="pt-1">
          <Timeline status={o.orderStatus} />
        </div>
      )}

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
    </article>
  );
}
