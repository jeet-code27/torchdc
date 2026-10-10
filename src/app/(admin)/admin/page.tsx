"use client";

import * as React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  Truck,
  Store,
  Sparkles,
  Plus,
  Shield,
  ShieldAlert,
  Clock,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { usePermissions } from "@/hooks/use-permissions";
import { StatusBadge } from "@/components/ui/status-badge";

interface DashboardData {
  stats: {
    totalRevenue: number;
    todayOrdersCount: number;
    todayDelivery: number;
    todayPickup: number;
    totalProducts: number;
    inStockProducts: number;
    totalCategories: number;
    totalBrands: number;
    totalCustomers: number;
    newCustomersThisWeek: number;
    queues: {
      delivery: {
        active: number;
        pending: number;
        outForDelivery: number;
      };
      pickup: {
        active: number;
        pending: number;
        ready: number;
      };
    };
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    fulfillmentType: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { user, role, permissions } = usePermissions();

  const [data, setData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = data?.stats;

  const statCards = [
    {
      title: "Total Revenue",
      value: isLoading
        ? "Loading..."
        : `$${(stats?.totalRevenue || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      change: "Lifetime COD Sales",
      icon: DollarSign,
      badge: "COD Sales",
    },
    {
      title: "Today's Orders",
      value: isLoading ? "Loading..." : String(stats?.todayOrdersCount || 0),
      change: `${stats?.todayDelivery || 0} Delivery • ${stats?.todayPickup || 0} Pickup`,
      icon: ShoppingBag,
      badge: `${(stats?.queues.delivery.active || 0) + (stats?.queues.pickup.active || 0)} Active`,
    },
    {
      title: "Catalog Products",
      value: isLoading ? "Loading..." : String(stats?.totalProducts || 0),
      change: `${stats?.totalCategories || 0} Categories • ${stats?.totalBrands || 0} Brands`,
      icon: Package,
      badge: `${stats?.inStockProducts || 0} In Stock`,
    },
    {
      title: "Registered Customers",
      value: isLoading ? "Loading..." : String(stats?.totalCustomers || 0),
      change: `+${stats?.newCustomersThisWeek || 0} new this week`,
      icon: Users,
      badge: "DC Metro",
    },
  ];

  const getOrderStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "success";
      case "out_for_delivery":
      case "ready_for_pickup":
      case "processing":
        return "default";
      case "pending":
        return "warning";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#5A805B]/10 text-[#5A805B] border border-[#5A805B]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DC Store Open • COD Delivery & Pickup</span>
            </div>
            {role && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                <Shield className="w-3 h-3 text-[#5A805B]" />
                <span>Role: {role}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ""}! RBAC session loaded ({permissions.length} active permissions).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Render button only if user has products.create permission */}
          <Can permission="products.create">
            <Button asChild variant="outline" className="text-xs sm:text-sm">
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Product</span>
              </Link>
            </Button>
          </Can>

          {/* Render button only if user has orders.view permission */}
          <Can permission="orders.view">
            <Button asChild className="text-xs sm:text-sm bg-[#5A805B] hover:bg-[#4a6b4b] text-white">
              <Link href="/admin/orders">
                <span>View Orders</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-card p-5 shadow-xs hover:border-[#5A805B]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    {stat.change}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                    {stat.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Overview Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fulfillment Pipeline */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Fulfillment Channels
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current order queue breakdown by fulfillment method
              </p>
            </div>
            <Can permission="orders.view">
              <Link
                href="/admin/orders"
                className="text-xs font-medium text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>Manage orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Can>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Delivery Queue */}
            <div className="p-4 rounded-lg border border-border/80 bg-background/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-[#5A805B]/10 text-[#5A805B]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      DC Local Delivery
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      COD payment upon arrival
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#5A805B]/15 text-[#5A805B]">
                  {stats?.queues.delivery.active || 0} Active
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border/60">
                <span>Pending Dispatch: {stats?.queues.delivery.pending || 0}</span>
                <span>Out for Delivery: {stats?.queues.delivery.outForDelivery || 0}</span>
              </div>
            </div>

            {/* Store Pickup Queue */}
            <div className="p-4 rounded-lg border border-border/80 bg-background/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-accent text-[#5A805B]">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Store Pickup
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Washington DC dispensary counter
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {stats?.queues.pickup.active || 0} Active
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border/60">
                <span>Pending Prep: {stats?.queues.pickup.pending || 0}</span>
                <span>Ready for Pickup: {stats?.queues.pickup.ready || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Access & Role Summary */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-foreground">
              RBAC Enforcement
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-layer security verification
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-accent/40 border border-[#5A805B]/20 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="w-4 h-4 text-[#5A805B]" />
                <span>Active Role: {role || "Loading..."}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Permissions stored directly in JWT token for fast edge middleware validation without querying the database.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Permission Gates
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border text-[11px]">
                <span>staff.manage</span>
                <Can
                  permission="staff.manage"
                  fallback={
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Blocked
                    </span>
                  }
                >
                  <span className="text-[#5A805B] font-semibold">Granted</span>
                </Can>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border text-[11px]">
                <span>products.create</span>
                <Can
                  permission="products.create"
                  fallback={
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Blocked
                    </span>
                  }
                >
                  <span className="text-[#5A805B] font-semibold">Granted</span>
                </Can>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border text-[11px]">
                <span>roles.manage</span>
                <Can
                  permission="roles.manage"
                  fallback={
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Blocked
                    </span>
                  }
                >
                  <span className="text-[#5A805B] font-semibold">Granted</span>
                </Can>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Recent Orders Feed */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Recent Live Orders
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live orders received from Washington D.C. storefront
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/admin/orders" className="flex items-center gap-1">
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading recent orders...
          </div>
        ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No orders found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="py-2.5 px-3 font-semibold">Order</th>
                  <th className="py-2.5 px-3 font-semibold">Customer</th>
                  <th className="py-2.5 px-3 font-semibold">Fulfillment</th>
                  <th className="py-2.5 px-3 font-semibold">Total</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono text-foreground">
                      {ord.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {ord.customerName}
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="inline-flex items-center gap-1">
                        {ord.fulfillmentType === "pickup" ? (
                          <Store className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Truck className="w-3 h-3 text-[#5A805B]" />
                        )}
                        {ord.fulfillmentType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge variant={getOrderStatusVariant(ord.status)}>
                        {ord.status.replace("_", " ")}
                      </StatusBadge>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#5A805B]">
                        <Link href={`/admin/orders/${ord._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
