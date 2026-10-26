"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AbandonedCartsView, type AbandonedCartDoc } from "@/components/admin/orders/AbandonedCartsView";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePermissions } from "@/hooks/use-permissions";

type DeleteRequest = { ids: string[] } | { olderThanDays: number } | { all: true };

/** Abandoned carts (linked from the bottom of the Orders screen), with clean-up of old carts. */
export default function AbandonedCartsPage() {
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission("orders.manage");
  const [carts, setCarts] = React.useState<AbandonedCartDoc[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [pending, setPending] = React.useState<{ req: DeleteRequest; title: string; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/carts/abandoned");
      const data = await res.json();
      if (data.success) {
        setCarts(data.carts || []);
        setTotal(data.totalAbandonedValue || 0);
      }
    } catch {
      toast.error("Couldn't load abandoned carts");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const runDelete = async (req: DeleteRequest) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/carts/abandoned", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      toast.success(`${data.deleted} abandoned cart${data.deleted === 1 ? "" : "s"} deleted`);
      await load();
    } catch (err) {
      toast.error((err as Error).message || "Delete failed");
    } finally {
      setBusy(false);
      setDeletingId(null);
      setPending(null);
    }
  };

  const weekOld = carts.filter((c) => Date.now() - new Date(c.lastActiveAt).getTime() > 7 * 24 * 3_600_000).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            ‹ Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Abandoned carts</h1>
          <p className="text-sm text-muted-foreground">
            Carts left for more than 30 minutes without an order. Name, phone and address show once the customer types them
            at checkout.
          </p>
        </div>
        {canDelete && carts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || weekOld === 0}
              onClick={() =>
                setPending({
                  req: { olderThanDays: 7 },
                  title: "Delete old abandoned carts?",
                  text: `This permanently deletes ${weekOld} abandoned cart${weekOld === 1 ? "" : "s"} older than 7 days.`,
                })
              }
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              Delete older than 7 days ({weekOld})
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setPending({
                  req: { all: true },
                  title: "Delete all abandoned carts?",
                  text: `This permanently deletes all ${carts.length} abandoned carts. Live carts and orders are not touched.`,
                })
              }
              className="h-9 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              Delete all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Loading abandoned carts…</p>
      ) : (
        <AbandonedCartsView
          abandonedCarts={carts}
          abandonedTotalValue={total}
          deletingId={deletingId}
          onDelete={
            canDelete
              ? (cart) =>
                  setPending({
                    req: { ids: [cart._id] },
                    title: "Delete this abandoned cart?",
                    text: `This permanently deletes the cart${cart.customerInfo?.name ? ` from ${cart.customerInfo.name}` : ""}.`,
                  })
              : undefined
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.title || ""}
        description={pending?.text || ""}
        confirmText="Delete"
        variant="destructive"
        isLoading={busy}
        onConfirm={() => {
          if (!pending) return;
          if ("ids" in pending.req) setDeletingId(pending.req.ids[0]);
          runDelete(pending.req);
        }}
      />
    </div>
  );
}
