'use client';

import Link from 'next/link';
import { useState } from 'react';

export type AttentionItem = {
  id: string;
  tone: 'urgent' | 'warning';
  title: string; // "#1007 waiting 2 days"
  detail: string; // "Maddie M. · Confirmed Oct 20, never sent out"
  actionLabel: string;
  href: string;
};

export type StoreSettingKey = 'deliveryEnabled' | 'pickupEnabled' | 'offerPopupEnabled';

export type DashboardTodayProps = {
  /** Pending (unconfirmed) orders right now. */
  newOrders: { count: number; oldestWait?: string };
  today: { outNow: number; deliveredToday: number; cashToCollect: number };
  /** Test orders must be excluded by the caller. */
  week: { cashCollected: number; pendingCash: number; orders: number; avgOrder: number };
  attention: AttentionItem[];
  /** offerPopupEnabled: the "Want $10 Off Your Order?" cart pop-up switch (shown when provided). */
  store: { deliveryEnabled: boolean; pickupEnabled: boolean; offerPopupEnabled?: boolean; hoursLabel: string };
  setStoreSetting: (key: StoreSettingKey, value: boolean) => Promise<void>;
  /** Place the push "Get new order alerts" card here (from the push alerts package). */
  alertsSlot?: React.ReactNode;
  ordersHref?: string;
  productsHref?: string;
};

const usd = (n: number, cents = false) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;

export default function DashboardToday({
  newOrders,
  today,
  week,
  attention,
  store,
  setStoreSetting,
  alertsSlot,
  ordersHref = '/admin/orders',
  productsHref = '/admin/products',
}: DashboardTodayProps) {
  const [settings, setSettings] = useState({
    deliveryEnabled: store.deliveryEnabled,
    pickupEnabled: store.pickupEnabled,
    offerPopupEnabled: store.offerPopupEnabled ?? true,
  });
  const [saveError, setSaveError] = useState(false);
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/New_York' });

  async function toggle(key: StoreSettingKey) {
    const next = !settings[key];
    setSettings((s) => ({ ...s, [key]: next }));
    setSaveError(false);
    try {
      await setStoreSetting(key, next);
    } catch {
      setSettings((s) => ({ ...s, [key]: !next }));
      setSaveError(true);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col pb-6 font-[Jost,system-ui,sans-serif] text-[#0a0a0a]">
      <div className="flex flex-col gap-2.5 px-4 pt-5">
        <div className="flex items-baseline justify-between">
          <h1 className="m-0 text-[28px] font-bold">Today</h1>
          <span className="text-sm text-[#52525b]">{dateLabel}</span>
        </div>
        <div className={`flex items-center gap-2 rounded-[10px] px-3 py-2.5 ${settings.deliveryEnabled ? 'bg-[#eef5ee]' : 'bg-[#f4f4f5]'}`}>
          <span className={`h-2 w-2 rounded-full ${settings.deliveryEnabled ? 'bg-[#2f7d3a]' : 'bg-[#a1a1aa]'}`} />
          <span className={`text-sm font-semibold ${settings.deliveryEnabled ? 'text-[#1f5a29]' : 'text-[#3f3f46]'}`}>
            {settings.deliveryEnabled ? 'Delivery open' : 'Delivery paused'}
          </span>
          <span className="text-sm text-[#3f3f46]">· {store.hoursLabel}</span>
        </div>
      </div>

      {alertsSlot}

      {newOrders.count > 0 && (
        <div className="px-4 pt-4">
          <Link href={`${ordersHref}?status=pending`} className="flex flex-col gap-3 rounded-[14px] bg-[#27272a] p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8fd18f]" />
                <span className="text-sm font-semibold text-[#e4e4e7]">New orders</span>
              </div>
              {newOrders.oldestWait && <span className="text-[13px] text-[#d4d4d8]">Oldest: {newOrders.oldestWait}</span>}
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-[44px] font-bold leading-none">{newOrders.count}</span>
              <span className="text-[15px] text-[#d4d4d8]">waiting for confirmation</span>
            </div>
            <span className="flex h-12 items-center justify-center rounded-[10px] bg-white text-[15px] font-semibold text-[#0a0a0a]">Review &amp; confirm</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 px-4 pt-2.5">
        <Tile href={`${ordersHref}?status=out_for_delivery`} label="Out now" value={String(today.outNow)} sub="With a driver" valueClass="text-[#4f7a52]" />
        <Tile href={`${ordersHref}?status=completed`} label="Delivered today" value={String(today.deliveredToday)} sub="Completed & paid" valueClass="text-[#3f6b40]" />
        <Tile href={ordersHref} label="Cash to collect" value={usd(today.cashToCollect)} sub="Open COD orders" valueClass="text-[#3f5c40]" wide />
      </div>

      {attention.length > 0 && (
        <section className="flex flex-col gap-2.5 px-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-lg font-bold">Needs attention</h2>
            <span className="rounded-full bg-[#be123c] px-2.5 py-0.5 text-[13px] font-semibold text-white">{attention.length}</span>
          </div>
          {attention.map((a) => (
            <div
              key={a.id}
              className={`flex flex-col gap-2.5 rounded-xl border p-3.5 ${a.tone === 'urgent' ? 'border-[#f5c2c7] bg-[#fff5f5]' : 'border-[#f3d9a4] bg-[#fffaf0]'}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{a.title}</span>
                <span className="text-[13px] text-[#3f3f46]">{a.detail}</span>
              </div>
              <Link
                href={a.href}
                className={`flex h-11 items-center justify-center rounded-[10px] text-sm font-semibold ${
                  a.tone === 'urgent' ? 'bg-[#3f3f46] text-white' : 'border border-[#d4a24c] bg-white'
                }`}
              >
                {a.actionLabel}
              </Link>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2.5 px-4 pt-6">
        <h2 className="m-0 text-lg font-bold">This week</h2>
        <div className="grid grid-cols-2 gap-3.5 rounded-xl border border-[#e4e4e7] p-3.5">
          <Mini label="Cash collected" value={usd(week.cashCollected)} />
          <Mini label="Pending cash" value={usd(week.pendingCash)} />
          <Mini label="Orders" value={String(week.orders)} />
          <Mini label="Avg order" value={usd(week.avgOrder, true)} />
          <span className="col-span-2 text-xs text-[#52525b]">Test orders excluded</span>
        </div>
      </section>

      <section className="flex flex-col gap-2.5 px-4 pt-6">
        <h2 className="m-0 text-lg font-bold">Store controls</h2>
        <div className="flex flex-col rounded-xl border border-[#e4e4e7]">
          <Switch label="Accepting delivery orders" on={settings.deliveryEnabled} onToggle={() => toggle('deliveryEnabled')} border />
          <Switch
            label="Store pickup"
            on={settings.pickupEnabled}
            onToggle={() => toggle('pickupEnabled')}
            border={store.offerPopupEnabled !== undefined}
          />
          {store.offerPopupEnabled !== undefined && (
            <Switch
              label="“Want $10 off?” pop-up on the cart"
              on={settings.offerPopupEnabled}
              onToggle={() => toggle('offerPopupEnabled')}
            />
          )}
        </div>
        {saveError && <p className="text-sm text-[#be123c]">Couldn&apos;t save that change. Try again.</p>}
      </section>

      <div className="grid grid-cols-2 gap-2.5 px-4 pt-6">
        <Link href={ordersHref} className="flex h-12 items-center justify-center rounded-[10px] bg-[#4c6e4d] text-[15px] font-semibold text-white">
          Orders
        </Link>
        <Link href={productsHref} className="flex h-12 items-center justify-center rounded-[10px] border border-[#d4d4d8] text-[15px] font-semibold">
          Products
        </Link>
      </div>
    </div>
  );
}

function Tile({ href, label, value, sub, valueClass, wide }: { href: string; label: string; value: string; sub: string; valueClass: string; wide?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col gap-1 rounded-xl border border-[#e4e4e7] p-3.5 ${wide ? 'col-span-2' : ''}`}>
      <span className="text-[13px] text-[#52525b]">{label}</span>
      <span className={`text-[32px] font-bold leading-tight ${valueClass}`}>{value}</span>
      <span className="text-xs text-[#52525b]">{sub}</span>
    </Link>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[13px] text-[#52525b]">{label}</span>
      <span className="text-[22px] font-bold">{value}</span>
    </div>
  );
}

function Switch({ label, on, onToggle, border }: { label: string; on: boolean; onToggle: () => void; border?: boolean }) {
  return (
    <div className={`flex min-h-14 items-center justify-between px-3.5 py-2 ${border ? 'border-b border-[#f0f0f2]' : ''}`}>
      <span className="text-[15px] font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`flex h-8 w-[52px] rounded-full p-[3px] ${on ? 'justify-end bg-[#4c6e4d]' : 'justify-start bg-[#d4d4d8]'}`}
      >
        <span className="h-[26px] w-[26px] rounded-full bg-white shadow" />
      </button>
    </div>
  );
}
