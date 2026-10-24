"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import OrdersList from "@/components/admin/orders/OrdersList";
import { postOrderStatus, toAdminOrder } from "@/components/admin/orders/map";
import type { AdminOrder, OrderStatus } from "@/components/admin/orders/types";
import { AbandonedCartsView, type AbandonedCartDoc } from "@/components/admin/orders/AbandonedCartsView";
import { LightSurface } from "@/components/admin/light-surface";

const FILTERS: Array<OrderStatus | "all"> = ["all", "pending", "confirmed", "out_for_delivery", "completed", "cancelled"];

export default function AdminOrdersPage() {
  return (
    <React.Suspense fallback={<LightSurface className="px-4 py-16 text-center text-sm text-[#52525b]">Loading orders…</LightSurface>}>
      <OrdersScreen />
    </React.Suspense>
  );
}

function OrdersScreen() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") as OrderStatus | "all" | null;
  const initialStatus = statusParam && FILTERS.includes(statusParam) ? statusParam : "all";

  const [orders, setOrders] = React.useState<AdminOrder[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [abandonedCarts, setAbandonedCarts] = React.useState<AbandonedCartDoc[]>([]);
  const [abandonedTotalValue, setAbandonedTotalValue] = React.useState(0);

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
      if (data.success) {
        setAbandonedCarts(data.carts || []);
        setAbandonedTotalValue(data.totalAbandonedValue || 0);
      }
    } catch (err) {
      console.error("Failed to load abandoned carts:", err);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
    loadAbandoned();
    // New orders show up without a manual refresh
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") loadOrders();
    }, 60_000);
    return () => window.clearInterval(timer);
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
      <OrdersList
        // remount when a dashboard link changes ?status=
        key={initialStatus}
        orders={orders}
        setStatus={setStatus}
        abandonedCount={abandonedCarts.length}
        abandonedView={<AbandonedCartsView abandonedCarts={abandonedCarts} abandonedTotalValue={abandonedTotalValue} />}
        initialStatus={initialStatus}
      />
    </LightSurface>
  );
}
