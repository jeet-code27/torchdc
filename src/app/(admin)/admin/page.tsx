"use client";

import * as React from "react";
import Link from "next/link";
import { DollarSign, Package, Users, ArrowRight, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import DashboardToday, { type AttentionItem, type StoreSettingKey } from "@/components/admin/dashboard/DashboardToday";
import OrderAlertsCard from "@/components/admin/OrderAlertsCard";
import PullToRefresh from "@/components/admin/PullToRefresh";
import { postOrderStatus } from "@/components/admin/orders/map";
import type { OrderStatus } from "@/components/admin/orders/types";
import { LightSurface } from "@/components/admin/light-surface";
import { usePermissions } from "@/hooks/use-permissions";

interface TodayData {
  newOrders: { count: number; oldestWait?: string };
  today: { outNow: number; deliveredToday: number; cashToCollect: number };
  week: { cashCollected: number; pendingCash: number; orders: number; avgOrder: number };
  attention: AttentionItem[];
}

interface StatsData {
  stats: {
    totalRevenue: number;
    totalProducts: number;
    inStockProducts: number;
    totalCategories: number;
    totalBrands: number;
    totalCustomers: number;
    newCustomersThisWeek: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    fulfillmentType: string;
    createdAt: string;
  }>;
}

interface StoreSettingsData {
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  offerPopupEnabled: boolean;
}

export default function AdminDashboardPage() {
  const { hasPermission } = usePermissions();
  const [today, setToday] = React.useState<TodayData | null>(null);
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [settings, setSettings] = React.useState<StoreSettingsData | null>(null);
  const [failed, setFailed] = React.useState(false);

  const loadToday = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard/today");
      const json = await res.json();
      if (json.success) setToday(json);
      else setFailed(true);
    } catch {
      setFailed(true);
    }
  }, []);

  const loadStats = React.useCallback(async () => {
    try {
      const json = await (await fetch("/api/admin/dashboard/stats")).json();
      if (json.success) setStats(json);
    } catch {}
  }, []);

  // Pull to refresh / auto-refresh every 30 s (PullToRefresh) reloads both
  const refreshAll = React.useCallback(async () => {
    await Promise.all([loadToday(), loadStats()]);
  }, [loadToday, loadStats]);

  // One-tap actions on the Needs attention cards
  const setStatus = React.useCallback(
    async (ids: string[], status: OrderStatus) => {
      await postOrderStatus(ids, status);
      loadToday();
    },
    [loadToday]
  );
  const setTestFlag = React.useCallback(
    async (orderIds: string[], isTest: boolean) => {
      const res = await fetch("/api/admin/orders/test-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds, isTest }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Could not save");
      loadToday();
      loadStats();
    },
    [loadToday, loadStats]
  );

  React.useEffect(() => {
    loadToday();
    loadStats();
    fetch("/api/admin/settings/store")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.settings) {
          setSettings({
            deliveryEnabled: json.settings.deliveryEnabled !== false,
            pickupEnabled: Boolean(json.settings.pickupEnabled),
            offerPopupEnabled: json.settings.offerPopupEnabled !== false,
          });
        }
      })
      .catch(() => {});
  }, [loadToday, loadStats]);

  const setStoreSetting = React.useCallback(async (key: StoreSettingKey, value: boolean) => {
    const res = await fetch("/api/admin/settings/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.error || "Could not save");
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }, []);

  const s = stats?.stats;
  const statCards = [
    {
      title: "Total Revenue",
      value: s ? `$${s.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "…",
      change: "Lifetime COD sales, test orders excluded",
      icon: DollarSign,
    },
    {
      title: "Catalog Products",
      value: s ? String(s.totalProducts) : "…",
      change: s ? `${s.inStockProducts} in stock • ${s.totalCategories} categories` : "",
      icon: Package,
    },
    {
      title: "Registered Customers",
      value: s ? String(s.totalCustomers) : "…",
      change: s ? `+${s.newCustomersThisWeek} new this week` : "",
      icon: Users,
    },
  ];

  return (
    <LightSurface className="pb-10">
      <PullToRefresh onRefresh={refreshAll}>
      {today && settings ? (
        <DashboardToday
          newOrders={today.newOrders}
          today={today.today}
          week={today.week}
          attention={today.attention}
          setStatus={setStatus}
          setTestFlag={setTestFlag}
          store={{ ...settings, hoursLabel: "7AM to 11PM" }}
          setStoreSetting={setStoreSetting}
          alertsSlot={hasPermission("orders.view") ? <OrderAlertsCard /> : null}
        />
      ) : (
        <p className="px-4 py-16 text-center text-sm text-[#52525b]">
          {failed ? "Couldn't load today's numbers. Refresh to try again." : "Loading…"}
        </p>
      )}

      {/* Store overview (from the previous dashboard) */}
      {stats && (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pt-6">
          <h2 className="m-0 text-lg font-bold">Store overview</h2>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="rounded-xl border border-border bg-card p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">{stat.title}</span>
                    <Icon className="h-4 w-4 text-[#5A805B]" />
                  </div>
                  <div className="mt-1 text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.change}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-3.5">
              <span className="text-[15px] font-semibold">Recent orders</span>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/admin/orders" className="flex items-center gap-1">
                  <span>All orders</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="m-0 list-none divide-y divide-border p-0">
                {stats.recentOrders.map((ord) => (
                  <li key={ord._id}>
                    <Link href={`/admin/orders/${ord._id}`} className="flex items-center gap-3 px-3.5 py-3 text-sm">
                      {ord.fulfillmentType === "pickup" ? (
                        <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Truck className="h-4 w-4 shrink-0 text-[#5A805B]" />
                      )}
                      <span className="font-mono font-bold">{ord.orderNumber}</span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{ord.customerName}</span>
                      <StatusBadge variant={ord.status === "completed" ? "success" : ord.status === "pending" ? "warning" : ord.status === "cancelled" ? "destructive" : "default"}>
                        {ord.status.replace(/_/g, " ")}
                      </StatusBadge>
                      <span className="font-mono font-semibold">${ord.total.toFixed(2)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
      </PullToRefresh>
    </LightSurface>
  );
}
