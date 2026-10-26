"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import OrdersList, { type OrdersFilter } from "@/components/admin/orders/OrdersList";
import PullToRefresh from "@/components/admin/PullToRefresh";
import { postOrderStatus, toAdminOrder } from "@/components/admin/orders/map";
import type { AdminOrder, OrderStatus } from "@/components/admin/orders/types";
import { LightSurface } from "@/components/admin/light-surface";

// ?filter=pending|confirmed|done, or the older ?status= links from the dashboard
const FILTER_OF: Record<string, OrdersFilter> = {
  pending: "pending",
  confirmed: "confirmed",
  out_for_delivery: "confirmed",
  done: "done",
  completed: "done",
  cancelled: "done",
};

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={<LightSurface className="px-4 py-16 text-center text-sm text-[#52525b]">Loading orders…</LightSurface>}>
      <OrdersScreen />
    </React.Suspense>
  );
}

function OrdersScreen() {
  const searchParams = useSearchParams();
  const initialFilter = FILTER_OF[searchParams.get("filter") || searchParams.get("status") || ""] || "pending";

  const [orders, setOrders] = React.useState<AdminOrder[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [abandonedCount, setAbandonedCount] = React.useState(0);

  const loadOrders = React.useCallback(async () => {
    try {
      // Test orders are excluded by the API
      const res = await fetch("/api/admin/orders?limit=500");
      const data = await res.json();
      if (data.success) {
        setOrders((data.orders || []).map(toAdminOrder));
        setLoadError(null);
      } else {
        setLoadError(data.error || "Couldn't load orders.");
      }
    } catch {
      setLoadError("Couldn't load orders. Check your connection and refresh.");
    }
  }, []);

  const loadAbandoned = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/carts/abandoned");
      const data = await res.json();
      if (data.success) setAbandonedCount(data.count || 0);
    } catch (err) {
      console.error("Failed to load abandoned carts:", err);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
    loadAbandoned();
  }, [loadOrders, loadAbandoned]);

  // Pull to refresh / auto-refresh every 30 s (PullToRefresh)
  const refreshAll = React.useCallback(async () => {
    await Promise.all([loadOrders(), loadAbandoned()]);
  }, [loadOrders, loadAbandoned]);

  const setStatus = React.useCallback(async (ids: string[], status: OrderStatus) => {
    const updated = await postOrderStatus(ids, status);
    const byId = new Map(updated.map((o) => [o._id, o]));
    setOrders((prev) => (prev ? prev.map((o) => byId.get(o._id) || o) : prev));
  }, []);

  if (loadError && !orders) {
    return <LightSurface className="px-4 py-16 text-center text-sm text-[#be123c]">{loadError}</LightSurface>;
  }
  if (!orders) {
    return <LightSurface className="px-4 py-16 text-center text-sm text-[#52525b]">Loading orders…</LightSurface>;
  }

  return (
    <LightSurface>
      <PullToRefresh onRefresh={refreshAll}>
        <OrdersList
          // remount when a dashboard link changes ?filter= / ?status=
          key={initialFilter}
          orders={orders}
          setStatus={setStatus}
          abandonedCount={abandonedCount}
          initialFilter={initialFilter}
        />
      </PullToRefresh>
    </LightSurface>
  );
}
