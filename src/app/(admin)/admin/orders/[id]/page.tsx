"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import OrderDetailView from "@/components/admin/orders/OrderDetailView";
import { postOrderStatus, toAdminOrder } from "@/components/admin/orders/map";
import type { AdminOrder, OrderStatus } from "@/components/admin/orders/types";
import { LightSurface } from "@/components/admin/light-surface";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = React.useState<AdminOrder | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.order) setOrder(toAdminOrder(data.order));
        else setError(data.error || "Order not found");
      } catch {
        if (!cancelled) setError("Couldn't load this order. Check your connection and refresh.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const setStatus = React.useCallback(async (ids: string[], status: OrderStatus) => {
    const [updated] = await postOrderStatus(ids, status);
    if (updated) setOrder(updated);
  }, []);

  const saveStaffNote = React.useCallback(async (id: string, note: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffNotes: note }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.error || "Could not save note");
  }, []);

  if (error) {
    return (
      <LightSurface className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-base font-semibold">{error}</p>
        <Link href="/admin/orders" className="text-sm font-medium underline">
          Back to orders
        </Link>
      </LightSurface>
    );
  }

  if (!order) {
    return <LightSurface className="px-4 py-16 text-center text-sm text-[#52525b]">Loading order…</LightSurface>;
  }

  return (
    <LightSurface>
      <OrderDetailView
        order={order}
        setStatus={setStatus}
        saveStaffNote={saveStaffNote}
        printHref={`/admin/orders/${order._id}/full?print=1`}
        moreHref={`/admin/orders/${order._id}/full`}
      />
    </LightSurface>
  );
}
