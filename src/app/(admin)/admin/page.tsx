"use client";

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
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { usePermissions } from "@/hooks/use-permissions";

const statCards = [
  {
    title: "Total Revenue",
    value: "$14,820.50",
    change: "+12.5% from last month",
    icon: DollarSign,
    badge: "COD Sales",
  },
  {
    title: "Today's Orders",
    value: "38",
    change: "24 Delivery • 14 Pickup",
    icon: ShoppingBag,
    badge: "Active",
  },
  {
    title: "Catalog Products",
    value: "124",
    change: "18 Categories • 8 Brands",
    icon: Package,
    badge: "In Stock",
  },
  {
    title: "Registered Customers",
    value: "842",
    change: "+28 new this week",
    icon: Users,
    badge: "DC Metro",
  },
];

export default function AdminDashboardPage() {
  const { user, role, permissions } = usePermissions();

  const triggerToastDemo = () => {
    toast.success("Welcome to Torch Admin! RBAC session active.");
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DC Store Open • COD Delivery & Pickup</span>
            </div>
            {role && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">
                <Shield className="w-3 h-3 text-primary" />
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
          <Button
            variant="outline"
            onClick={triggerToastDemo}
            className="text-xs sm:text-sm"
          >
            Test Toast
          </Button>

          {/* Render button only if user has products.create permission */}
          <Can permission="products.create">
            <Button asChild variant="outline" className="text-xs sm:text-sm">
              <Link href="/admin/products">
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Product</span>
              </Link>
            </Button>
          </Can>

          {/* Render button only if user has orders.view permission */}
          <Can permission="orders.view">
            <Button asChild className="text-xs sm:text-sm">
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
              className="rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div className="h-8 w-8 rounded-lg bg-accent text-primary flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-foreground">
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
        {/* Fulfillment Pipeline Placeholder */}
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
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
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
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/15 text-primary">
                  24 Active
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border/60">
                <span>Pending Dispatch: 8</span>
                <span>Out for Delivery: 16</span>
              </div>
            </div>

            {/* Store Pickup Queue */}
            <div className="p-4 rounded-lg border border-border/80 bg-background/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-accent text-primary">
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
                  14 Active
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between pt-1 border-t border-border/60">
                <span>Pending Prep: 5</span>
                <span>Ready for Pickup: 9</span>
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
            <div className="p-3 rounded-lg bg-accent/40 border border-primary/20 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="w-4 h-4 text-primary" />
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
                  <span className="text-primary font-medium">Granted</span>
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
                  <span className="text-primary font-medium">Granted</span>
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
                  <span className="text-primary font-medium">Granted</span>
                </Can>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
