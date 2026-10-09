"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  ShoppingBag,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Save,
  Check,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  weight?: string;
  category?: string;
  quantity: number;
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer;
  fulfillment: "delivery" | "pickup";
  deliveryAddress?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  deliveryNotes?: string;
  pickupLocation?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash_on_delivery" | "cash_on_pickup";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "out_for_delivery"
    | "ready_for_pickup"
    | "completed"
    | "cancelled";
  isAgeVerified: boolean;
  sessionId?: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SingleOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form states for status update
  const [selectedStatus, setSelectedStatus] = React.useState<OrderDetail["orderStatus"]>("confirmed");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<OrderDetail["paymentStatus"]>("pending");
  const [staffNotes, setStaffNotes] = React.useState("");

  // Fetch Order
  const fetchOrder = React.useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setSelectedStatus(data.order.orderStatus);
        setSelectedPaymentStatus(data.order.paymentStatus);
        setStaffNotes(data.order.deliveryNotes || "");
      } else {
        toast.error(data.error || "Order not found");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Handle Save Updates
  const handleSaveUpdates = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: selectedStatus,
          paymentStatus: selectedPaymentStatus,
          deliveryNotes: staffNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        toast.success("Order status and notes updated successfully!");
      } else {
        toast.error(data.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: OrderDetail["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case "ready_for_pickup":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <Store className="w-3.5 h-3.5" /> Ready for Pickup
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed & Paid
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <X className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  // Timeline Step Checker
  const getTimelineSteps = () => {
    if (!order) return [];
    const isPickup = order.fulfillment === "pickup";
    const status = order.orderStatus;

    return [
      {
        id: "placed",
        title: "Order Placed",
        subtitle: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        done: true,
      },
      {
        id: "confirmed",
        title: "Store Confirmed",
        subtitle: "Order prepared by staff",
        done: status !== "pending" && status !== "cancelled",
      },
      {
        id: isPickup ? "ready" : "out",
        title: isPickup ? "Ready for Pickup" : "Out for Delivery",
        subtitle: isPickup ? "At 1025 F St NW counter" : "Driver on the road in DC",
        done: status === "out_for_delivery" || status === "ready_for_pickup" || status === "completed",
      },
      {
        id: "completed",
        title: "Fulfilled & Paid",
        subtitle: "Order delivered / handed over",
        done: status === "completed",
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Clock className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested order could not be located in the database.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const mapSearchUrl = order.deliveryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${order.deliveryAddress.street || ""}, ${order.deliveryAddress.city || "Washington"}, DC ${order.deliveryAddress.zip || "20005"}`
      )}`
    : null;

  return (
    <div className="space-y-6 pb-12 print:space-y-4">
      {/* Top Action Bar (Hidden when printing invoice) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Back to Orders List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {order.orderNumber}
              </h1>
              {getStatusBadge(order.orderStatus)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(order.createdAt).toLocaleString("en-US", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Print Invoice / Slip</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block border-b border-border pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">TORCH DISPENSARY</h1>
            <p className="text-xs text-muted-foreground">1025 F St NW, Washington, DC 20004</p>
            <p className="text-xs text-muted-foreground">Delivery Hotline & Curbside Pickup</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-mono font-bold">{order.orderNumber}</h2>
            <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-xs font-semibold capitalize">{order.fulfillment} Order</p>
          </div>
        </div>
      </div>

      {/* Status Timeline Bar (Print: hidden) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm print:hidden">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Fulfillment Timeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getTimelineSteps().map((step, idx) => (
            <div key={step.id} className="relative flex flex-col">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step.done
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground ml-9 mt-0.5">
                {step.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items & Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchased Items Card */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Order Items ({order.items.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-primary">
                {order.items.reduce((acc, it) => acc + it.quantity, 0)} total units
              </span>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition">
                  <div className="w-14 h-14 rounded-lg bg-muted relative overflow-hidden flex-shrink-0 border border-border">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-muted-foreground m-auto mt-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground">
                      {item.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                      {item.category && (
                        <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium border border-border">
                          {item.category}
                        </span>
                      )}
                      {item.weight && (
                        <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-medium border border-border">
                          Weight: {item.weight}
                        </span>
                      )}
                      <span>Price: ${item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    <div className="text-sm font-bold text-primary mt-0.5">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="p-5 bg-muted/30 border-t border-border space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>DC Metro Delivery</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-base font-bold text-foreground">
                <span>Total Amount Due</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <User className="w-4 h-4 text-primary" /> Customer Profile
              </div>

              <div>
                <div className="text-base font-bold text-foreground">
                  {order.customer.name}
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 21+ Age Verified (I-71)
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    {order.customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {order.customer.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Fulfillment / Delivery Destination */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {order.fulfillment === "delivery" ? (
                    <Truck className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Store className="w-4 h-4 text-emerald-500" />
                  )}
                  {order.fulfillment === "delivery" ? "Delivery Destination" : "Store Pickup"}
                </div>
                {mapSearchUrl && (
                  <a
                    href={mapSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium print:hidden"
                  >
                    <MapPin className="w-3 h-3" /> Maps <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {order.fulfillment === "delivery" ? (
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground text-sm">
                    {order.deliveryAddress?.street}
                    {order.deliveryAddress?.apartment ? `, Apt ${order.deliveryAddress.apartment}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zip}
                  </p>
                  {order.deliveryNotes && (
                    <div className="mt-3 p-2.5 rounded-lg bg-muted/60 border border-border">
                      <span className="font-semibold text-foreground block mb-0.5">Customer Delivery Notes:</span>
                      <p className="italic text-muted-foreground">&quot;{order.deliveryNotes}&quot;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p className="font-bold text-foreground text-sm">TORCH Dispensary Counter</p>
                  <p className="text-muted-foreground">1025 F St NW, Washington, DC 20004</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Order held securely for customer counter identification & collection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Management & Status Controls (Print: hidden) */}
        <div className="space-y-6 print:hidden">
          {/* Order Actions Box */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Manage Order State
            </h3>

            {/* Order Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderDetail["orderStatus"])}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="ready_for_pickup">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value as OrderDetail["paymentStatus"])}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="pending">Pending (Cash on Delivery / Pickup)</option>
                <option value="paid">Paid & Verified</option>
                <option value="failed">Failed / Uncollected</option>
              </select>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Dispatch / Staff Notes</label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Driver assigned, packing remarks, special instructions..."
                className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            <button
              onClick={handleSaveUpdates}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs shadow transition disabled:opacity-50"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
              <span>{isSaving ? "Saving Changes..." : "Save Order Updates"}</span>
            </button>
          </div>

          {/* Payment & Security Metadata Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Method
            </h4>
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-bold text-foreground uppercase">
                  {order.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold capitalize text-amber-600 dark:text-amber-400">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">I-71 21+ Verified:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">YES</span>
              </div>
            </div>
            {order.sessionId && (
              <p className="text-[10px] font-mono text-muted-foreground truncate">
                Session: {order.sessionId}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
