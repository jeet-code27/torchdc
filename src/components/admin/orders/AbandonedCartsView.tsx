"use client";

import { AlertTriangle, CheckCircle2, Mail, Phone, Store, Truck } from "lucide-react";

export interface AbandonedCartDoc {
  _id: string;
  sessionId: string;
  subtotal: number;
  fulfillment: "delivery" | "pickup";
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{ name: string; quantity: number }>;
  lastActiveAt: string;
  createdAt: string;
}

/** Abandoned carts table (unchanged from the previous Orders page; shown in the Abandoned tab). */
export function AbandonedCartsView({
  abandonedCarts,
  abandonedTotalValue,
}: {
  abandonedCarts: AbandonedCartDoc[];
  abandonedTotalValue: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Live Abandoned Carts Tracker
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Carts untouched for &gt; 30 minutes without checkout completion. Real-time contact capture enabled.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Total Lost Value:</span>{" "}
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            ${abandonedTotalValue.toFixed(2)}
          </span>
        </div>
      </div>

      {abandonedCarts.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">No abandoned carts right now!</p>
          <p className="text-xs text-muted-foreground mt-1">
            All customer sessions are either active or converted into completed orders.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/70 text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold">Session / Customer</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 font-semibold">Fulfillment</th>
                <th className="py-3 px-4 font-semibold">Items In Cart</th>
                <th className="py-3 px-4 font-semibold">Cart Value</th>
                <th className="py-3 px-4 font-semibold">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {abandonedCarts.map((cart) => (
                <tr key={cart._id} className="hover:bg-muted/30">
                  <td className="py-3 px-4 font-mono">
                    <div className="text-foreground font-semibold">
                      {cart.customerInfo?.name || "Anonymous Guest"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {cart.sessionId ? `Session: ${cart.sessionId.slice(0, 16)}...` : ""}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {cart.customerInfo?.email || cart.customerInfo?.phone ? (
                      <div className="space-y-0.5">
                        {cart.customerInfo?.phone && (
                          <div className="text-foreground font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {cart.customerInfo.phone}
                          </div>
                        )}
                        {cart.customerInfo?.email && (
                          <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" /> {cart.customerInfo.email}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No contact typed yet</span>
                    )}
                  </td>
                  <td className="py-3 px-4 capitalize">
                    {cart.fulfillment === "delivery" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                        <Truck className="w-3 h-3" /> Delivery
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Store className="w-3 h-3" /> Pickup
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs truncate text-muted-foreground">
                      {cart.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
                    ${cart.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(cart.lastActiveAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
