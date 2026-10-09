"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  User,
  AlertTriangle,
  ExternalLink,
  Filter,
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

interface OrderDoc {
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
  createdAt: string;
}

interface AbandonedCartDoc {
  _id: string;
  sessionId: string;
  subtotal: number;
  fulfillment: "delivery" | "pickup";
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  lastActiveAt: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = React.useState<
    "all" | "delivery" | "pickup" | "abandoned"
  >("all");
  const [orders, setOrders] = React.useState<OrderDoc[]>([]);
  const [abandonedCarts, setAbandonedCarts] = React.useState<AbandonedCartDoc[]>([]);
  const [abandonedTotalValue, setAbandonedTotalValue] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedOrder, setSelectedOrder] = React.useState<OrderDoc | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Fetch orders
  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (activeTab === "delivery") params.set("fulfillment", "delivery");
      if (activeTab === "pickup") params.set("fulfillment", "pickup");

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, activeTab]);

  // Fetch abandoned carts
  const fetchAbandonedCarts = React.useCallback(async () => {
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
    if (activeTab === "abandoned") {
      fetchAbandonedCarts();
    } else {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, fetchAbandonedCarts]);

  // Handle status update
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderDoc["orderStatus"],
    newPayment?: OrderDoc["paymentStatus"]
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
          paymentStatus: newPayment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order updated to ${newStatus.replace(/_/g, " ")}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? data.order : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        toast.error(data.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status badge helper compatible with light/dark mode
  const getStatusBadge = (status: OrderDoc["orderStatus"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Truck className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case "ready_for_pickup":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <Store className="w-3 h-3" /> Ready for Pickup
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <X className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const pendingCount = orders.filter(
    (o) => o.orderStatus === "confirmed" || o.orderStatus === "pending"
  ).length;
  const deliveryCount = orders.filter((o) => o.fulfillment === "delivery").length;
  const pickupCount = orders.filter((o) => o.fulfillment === "pickup").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-primary" />
            Orders & Live Carts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track customer orders, DC delivery dispatches, store pickups & abandoned cart conversions.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "abandoned") fetchAbandonedCarts();
            else fetchOrders();
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-muted text-foreground text-xs font-medium border border-border shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
          Refresh Live Data
        </button>
      </div>

      {/* Metric Cards (Theme Aware) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Total Orders</div>
          <div className="text-2xl font-bold text-foreground mt-1">{orders.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active store records
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">To Fulfill</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Confirmed / Pending dispatch
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Fulfillment Split</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {deliveryCount} / {pickupCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {deliveryCount} Delivery • {pickupCount} Pickup
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground">Abandoned Carts</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {abandonedCarts.length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            ${abandonedTotalValue.toFixed(2)} recoverable sales
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
            activeTab === "all"
              ? "bg-muted text-primary border-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> All Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
            activeTab === "delivery"
              ? "bg-muted text-primary border-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> DC Delivery ({deliveryCount})
        </button>

        <button
          onClick={() => setActiveTab("pickup")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
            activeTab === "pickup"
              ? "bg-muted text-primary border-primary"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
        >
          <Store className="w-3.5 h-3.5" /> Store Pickups ({pickupCount})
        </button>

        <button
          onClick={() => setActiveTab("abandoned")}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center gap-2 border-b-2 ${
            activeTab === "abandoned"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500"
              : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 border-transparent"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Abandoned Carts ({abandonedCarts.length})
        </button>
      </div>

      {/* Controls & Search (when not in abandoned carts tab) */}
      {activeTab !== "abandoned" && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab Content: Orders View */}
      {activeTab !== "abandoned" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1">
                New orders placed via Guest Checkout will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-muted-foreground uppercase tracking-wider text-[11px] border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order #</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold">Total</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-muted/40 transition cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{order.customer.name}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customer.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {order.fulfillment === "delivery" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            <Truck className="w-3 h-3" /> Delivery
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Store className="w-3 h-3" /> Pickup
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.items.reduce((s, it) => s + it.quantity, 0)} items
                      </td>
                      <td className="py-3 px-4 font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground text-xs border border-border transition"
                          >
                            <Eye className="w-3 h-3" /> Quick View
                          </button>
                          <Link
                            href={`/admin/orders/${order._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-medium transition"
                          >
                            <ExternalLink className="w-3 h-3" /> Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tab Content: Abandoned Carts View (Theme Aware) */
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
      )}

      {/* Quick View Order Modal (Theme-Aware Light & Dark) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-foreground">
                    {selectedOrder.orderNumber}
                  </span>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/orders/${selectedOrder._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Full Order Page
                </Link>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Changers */}
            <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
              <div className="text-xs font-semibold text-foreground">
                Quick Status Action:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id, "confirmed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedOrder.orderStatus === "confirmed"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Confirmed
                </button>

                {selectedOrder.fulfillment === "delivery" ? (
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder._id, "out_for_delivery")
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedOrder.orderStatus === "out_for_delivery"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Out for Delivery
                  </button>
                ) : (
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder._id, "ready_for_pickup")
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedOrder.orderStatus === "ready_for_pickup"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-background border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    Ready for Pickup
                  </button>
                )}

                <button
                  disabled={isUpdatingStatus}
                  onClick={() =>
                    handleUpdateStatus(selectedOrder._id, "completed", "paid")
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedOrder.orderStatus === "completed"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Completed & Paid
                </button>

                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id, "cancelled")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedOrder.orderStatus === "cancelled"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-background border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" /> Customer Details
                </div>
                <div className="text-sm font-bold text-foreground">
                  {selectedOrder.customer.name}
                </div>
                <div className="text-xs text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <a
                    href={`tel:${selectedOrder.customer.phone}`}
                    className="hover:underline text-primary font-medium"
                  >
                    {selectedOrder.customer.phone}
                  </a>
                </div>
                <div className="text-xs text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <a
                    href={`mailto:${selectedOrder.customer.email}`}
                    className="hover:underline text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {selectedOrder.customer.email}
                  </a>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 21+ Age Verified (I-71)
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  {selectedOrder.fulfillment === "delivery" ? (
                    <Truck className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Store className="w-4 h-4 text-emerald-500" />
                  )}
                  {selectedOrder.fulfillment === "delivery"
                    ? "DC Delivery Address"
                    : "Dispensary Store Pickup"}
                </div>

                {selectedOrder.fulfillment === "delivery" ? (
                  <div className="text-xs text-foreground space-y-1">
                    <p className="font-semibold text-foreground">
                      {selectedOrder.deliveryAddress?.street}
                      {selectedOrder.deliveryAddress?.apartment
                        ? `, Apt ${selectedOrder.deliveryAddress.apartment}`
                        : ""}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.deliveryAddress?.city},{" "}
                      {selectedOrder.deliveryAddress?.state}{" "}
                      {selectedOrder.deliveryAddress?.zip}
                    </p>
                    {selectedOrder.deliveryNotes && (
                      <p className="mt-2 text-muted-foreground italic bg-muted/60 p-2 rounded-lg border border-border">
                        &quot;{selectedOrder.deliveryNotes}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-foreground space-y-1">
                    <p className="font-semibold text-foreground">TORCH Dispensary</p>
                    <p className="text-muted-foreground">1025 F St NW, Washington, DC 20004</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      Ready for counter collection upon arrival
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-foreground">
                Purchased Items ({selectedOrder.items.length})
              </div>
              <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted relative overflow-hidden flex-shrink-0 border border-border">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-muted-foreground m-auto mt-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        {item.weight && (
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium border border-border">
                            {item.weight}
                          </span>
                        )}
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-primary text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Totals */}
            <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Delivery Fee</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-sm font-bold text-foreground">
                <span>Total Due ({selectedOrder.paymentMethod === "cash_on_pickup" ? "Cash on Pickup" : "Cash on Delivery"})</span>
                <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                <span>Payment Status:</span>
                <span className="font-bold uppercase text-amber-600 dark:text-amber-400">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Full Page Link Bottom Bar */}
            <div className="pt-2 flex justify-end">
              <Link
                href={`/admin/orders/${selectedOrder._id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs shadow transition"
              >
                <span>Open Full Order Management Screen</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
