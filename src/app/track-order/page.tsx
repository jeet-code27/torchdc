"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Package,
  MapPin,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";

interface TrackedOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  fulfillment: "delivery" | "pickup";
  orderStatus:
    | "pending"
    | "confirmed"
    | "out_for_delivery"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  deliveryFee: number;
  deliveryNotes?: string;
  deliveryAddress?: {
    city?: string;
    state?: string;
    zip?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    weight?: string;
  }>;
  createdAt: string;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("order") || "";

  const [query, setQuery] = React.useState(initialQuery);
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSearch = React.useCallback(async (searchKey: string) => {
    if (!searchKey.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(searchKey.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setErrorMsg(data.error || "No matching order found. Please check your order # or phone.");
      }
    } catch {
      setErrorMsg("Failed to connect to the order tracking service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Status timeline steps
  const getTimelineSteps = () => {
    if (!order) return [];
    const isPickup = order.fulfillment === "pickup";
    const status = order.orderStatus;

    return [
      {
        id: "placed",
        title: "Order Placed",
        desc: "Order received in our system",
        done: true,
      },
      {
        id: "confirmed",
        title: "Order Confirmed",
        desc: "Staff preparing your package",
        done: status !== "pending" && status !== "cancelled",
      },
      {
        id: isPickup ? "ready" : "out",
        title: isPickup ? "Ready for Pickup" : "Out for Delivery",
        desc: isPickup ? "Counter collection ready" : "Driver on the way in DC metro",
        done: status === "out_for_delivery" || status === "ready_for_pickup" || status === "completed",
      },
      {
        id: "delivered",
        title: isPickup ? "Picked Up" : "Delivered",
        desc: "Enjoy your Torch session!",
        done: status === "completed",
      },
    ];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF9]">
      <StoreNavbar />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5A805B]/10 text-[#5A805B] text-xs font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" />
              <span>Real-Time DC Delivery Dispatch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Track Your Order
            </h1>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Enter your Order Number (e.g. <span className="font-mono font-semibold text-zinc-700">TORCH-750480</span>) or your 10-digit mobile phone number.
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-2.5 shadow-sm border border-zinc-200 flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Order # (TORCH-...) or Phone Number"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-transparent bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#5A805B] transition font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="py-3 px-8 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] active:scale-95 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Track Status</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Need help? Contact our dispatch line directly at{" "}
                  <a href="tel:+12024681966" className="font-bold underline">
                    (202) 468-1966
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* Order Tracking Result View */}
          {order && (
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xl font-extrabold text-zinc-900">
                      {order.orderNumber}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#5A805B]/15 text-[#5A805B] border border-[#5A805B]/30">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Ordered on {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-zinc-500">Estimated Fulfillment</div>
                  <div className="text-sm font-bold text-[#5A805B] mt-0.5">
                    {order.orderStatus === "completed"
                      ? "Delivered & Completed"
                      : "35 - 45 Minutes (Fast DC Dispatch)"}
                  </div>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Live Dispatch Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {getTimelineSteps().map((step, idx) => (
                    <div key={step.id} className="relative flex flex-col">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            step.done
                              ? "bg-[#5A805B] text-white shadow-sm"
                              : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                          }`}
                        >
                          {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            step.done ? "text-zinc-900" : "text-zinc-400"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 ml-9 mt-1">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment & Destination Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                    {order.fulfillment === "delivery" ? (
                      <Truck className="w-5 h-5 text-[#5A805B]" />
                    ) : (
                      <Store className="w-5 h-5 text-[#5A805B]" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {order.fulfillment === "delivery" ? "Delivery Destination" : "Pickup Location"}
                    </div>
                    <div className="text-sm font-bold text-zinc-900 mt-0.5">
                      {order.fulfillment === "delivery"
                        ? `Washington, DC Metro (${order.deliveryAddress?.zip || "DC Area"})`
                        : "Torch Dispensary · 1025 F St NW, Washington, DC"}
                    </div>
                    {order.deliveryNotes && (
                      <div className="text-xs text-zinc-500 italic mt-1">
                        Notes: &quot;{order.deliveryNotes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href="tel:+12024681966"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-800 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5A805B]" />
                  <span>Call Dispatcher</span>
                </a>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ordered Items ({order.items.length})
                </h3>
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 relative overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-zinc-400 m-auto mt-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          {item.weight && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-semibold text-[10px]">
                              {item.weight}
                            </span>
                          )}
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>${item.price.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#5A805B] text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>DC Express Delivery</span>
                  <span className="font-bold text-[#5A805B]">FREE</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-bold text-zinc-900">
                  <span>Total Due (Cash on {order.fulfillment === "delivery" ? "Delivery" : "Pickup"})</span>
                  <span className="text-[#5A805B] font-extrabold text-base">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Compliance & Help Note */}
              <div className="text-center pt-2 text-[11px] text-zinc-400 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5A805B]" />
                  <span>Initiative 71 Compliant · 21+ Valid Government ID Required upon delivery</span>
                </p>
                <p>Torch Dispensary · 1025 F St NW, Washington, DC 20004</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
