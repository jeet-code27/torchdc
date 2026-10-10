"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowUpDown,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
  lastOrderStatus: string | null;
  addresses: Array<{
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  registeredCount: number;
  guestCount: number;
  totalRevenue: number;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  addresses: Array<{
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
  joinedAt: string;
  orders: Array<{
    _id: string;
    orderNumber: string;
    fulfillment: "delivery" | "pickup";
    total: number;
    orderStatus: string;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      weight?: string;
    }>;
  }>;
}

export default function CustomersAdminPage() {
  const [customers, setCustomers] = React.useState<CustomerSummary[]>([]);
  const [stats, setStats] = React.useState<CustomerStats>({
    totalCustomers: 0,
    registeredCount: 0,
    guestCount: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "registered" | "guest">("all");
  const [sortBy, setSortBy] = React.useState<"spend" | "orders" | "recent" | "name">("spend");

  // Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = React.useState<CustomerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

  // Fetch customers directory
  const loadCustomers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        type: typeFilter,
        sort: sortBy,
      });
      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to load customers");
      }
    } catch {
      toast.error("Network error while loading customers");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, sortBy]);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Fetch detailed customer profile when selected
  const openCustomerDetail = async (id: string) => {
    setSelectedCustomerId(id);
    setIsLoadingDetail(true);
    setCustomerDetail(null);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomerDetail(data.customer);
      } else {
        toast.error("Could not load customer details");
      }
    } catch {
      toast.error("Failed to load customer profile");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDrawer = () => {
    setSelectedCustomerId(null);
    setCustomerDetail(null);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (customers.length === 0) {
      toast.error("No customer records to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Account Type",
      "Total Orders",
      "Total Spent ($)",
      "Last Order Date",
      "DC Address",
    ];

    const rows = customers.map((c) => {
      const address = c.addresses[0]
        ? `${c.addresses[0].street || ""}, ${c.addresses[0].city || "Washington"} DC ${c.addresses[0].zip || ""}`
        : "";
      return [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        c.isRegistered ? "Registered" : "Guest",
        c.totalOrders,
        c.totalSpent.toFixed(2),
        c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "None",
        `"${address.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `torch-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Customer directory exported to CSV");
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Completed
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Out for Delivery
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
            {status ? status.replace(/_/g, " ") : "Pending"}
          </span>
        );
    }
  };

  return (
    <PermissionGuard permission="customers.view">
      <div className="space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Customer Directory
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage registered member profiles, guest order histories, and DC delivery accounts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadCustomers()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition"
              title="Refresh Customer List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] text-white text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Shoppers</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.totalCustomers}
            </div>
            <p className="text-[11px] text-muted-foreground">Combined registered & guest</p>
          </div>

          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Registered Members</span>
              <div className="w-8 h-8 rounded-lg bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#5A805B]">
              {stats.registeredCount}
            </div>
            <p className="text-[11px] text-muted-foreground">With saved Torch logins</p>
          </div>

          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Guest Buyers</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.guestCount}
            </div>
            <p className="text-[11px] text-muted-foreground">One-time express checkouts</p>
          </div>

          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Lifetime Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#5A805B]">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground">Cash on Delivery & Pickup</p>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Sorting */}
        <div className="bg-card rounded-2xl p-3 sm:p-4 border border-border shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B] transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type Filter Buttons */}
            <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "all"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({stats.totalCustomers})
              </button>
              <button
                onClick={() => setTypeFilter("registered")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "registered"
                    ? "bg-card text-foreground shadow-xs font-bold text-[#5A805B]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Registered ({stats.registeredCount})
              </button>
              <button
                onClick={() => setTypeFilter("guest")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  typeFilter === "guest"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Guests ({stats.guestCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-xl border border-input bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
              >
                <option value="spend">Highest Spend</option>
                <option value="orders">Most Orders</option>
                <option value="recent">Most Recent Order</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="w-6 h-6 border-2 border-[#5A805B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading customers...</span>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground space-y-2">
                      <Users className="w-8 h-8 mx-auto text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">No customers found</p>
                      <p className="text-xs">Try adjusting your search query or filters.</p>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => {
                    const initials = cust.name
                      ? cust.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "CU";

                    return (
                      <tr
                        key={cust.id}
                        className="hover:bg-muted/40 transition cursor-pointer"
                        onClick={() => openCustomerDetail(cust.id)}
                      >
                        {/* Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center font-extrabold text-xs shrink-0 border border-[#5A805B]/25">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-foreground truncate max-w-[160px]">
                                {cust.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Joined {new Date(cust.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact info */}
                        <td className="py-3.5 px-4 space-y-0.5">
                          {cust.email ? (
                            <a
                              href={`mailto:${cust.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-foreground hover:text-[#5A805B] flex items-center gap-1.5 truncate max-w-[190px]"
                            >
                              <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{cust.email}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">No email</span>
                          )}
                          {cust.phone ? (
                            <a
                              href={`tel:${cust.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-[#5A805B] flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span>{cust.phone}</span>
                            </a>
                          ) : null}
                        </td>

                        {/* Account Type Badge */}
                        <td className="py-3.5 px-4">
                          {cust.isRegistered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5A805B]/15 text-[#5A805B] border border-[#5A805B]/30">
                              <ShieldCheck className="w-3 h-3" /> Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                              Guest
                            </span>
                          )}
                        </td>

                        {/* Total Orders */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-foreground">
                            {cust.totalOrders}
                          </span>
                        </td>

                        {/* Total Spent */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#5A805B]">
                            ${cust.totalSpent.toFixed(2)}
                          </span>
                        </td>

                        {/* Last Order */}
                        <td className="py-3.5 px-4">
                          {cust.lastOrderDate ? (
                            <div>
                              <div className="font-medium text-foreground">
                                {new Date(cust.lastOrderDate).toLocaleDateString()}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {getStatusBadge(cust.lastOrderStatus || undefined)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Never ordered</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCustomerDetail(cust.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Drawer Modal */}
        {selectedCustomerId && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div
              className="w-full max-w-xl bg-card border-l border-border h-full shadow-2xl overflow-y-auto flex flex-col animate-in slide-in-from-right duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#5A805B] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                    {customerDetail?.name
                      ? customerDetail.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "CU"}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {customerDetail?.name || "Customer Profile"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {customerDetail?.isRegistered ? "Verified Registered Account" : "Guest Shopper Profile"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-6 space-y-6 flex-1">
                {isLoadingDetail ? (
                  <div className="py-24 text-center text-muted-foreground space-y-2">
                    <div className="w-6 h-6 border-2 border-[#5A805B] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs">Loading complete customer record...</p>
                  </div>
                ) : customerDetail ? (
                  <>
                    {/* Lifetime Metric Highlights */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-center space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Total Spend
                        </span>
                        <span className="text-lg font-extrabold text-[#5A805B]">
                          ${customerDetail.totalSpent.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-center space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Orders Placed
                        </span>
                        <span className="text-lg font-extrabold text-foreground">
                          {customerDetail.totalOrders}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-center space-y-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                          Avg Order Value
                        </span>
                        <span className="text-lg font-extrabold text-foreground">
                          ${customerDetail.averageOrderValue.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Contact & Communication Card */}
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Contact Details
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Email
                          </span>
                          {customerDetail.email ? (
                            <a
                              href={`mailto:${customerDetail.email}`}
                              className="font-bold text-[#5A805B] hover:underline"
                            >
                              {customerDetail.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">None provided</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Mobile Phone
                          </span>
                          {customerDetail.phone ? (
                            <a
                              href={`tel:${customerDetail.phone}`}
                              className="font-bold text-[#5A805B] hover:underline"
                            >
                              {customerDetail.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">None provided</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> First Active
                          </span>
                          <span className="font-semibold text-foreground">
                            {new Date(customerDetail.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Saved DC Delivery Addresses */}
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5A805B]" />
                        <span>DC Delivery Addresses ({customerDetail.addresses.length})</span>
                      </h3>

                      {customerDetail.addresses.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                          No delivery addresses recorded yet (Pickup orders only).
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {customerDetail.addresses.map((addr, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-card border border-border flex items-start gap-2.5 text-xs"
                            >
                              <MapPin className="w-4 h-4 text-[#5A805B] shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-foreground">
                                  {addr.street}
                                  {addr.apartment ? `, Apt ${addr.apartment}` : ""}
                                </p>
                                <p className="text-muted-foreground">
                                  {addr.city || "Washington"}, {addr.state || "DC"} {addr.zip}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Orders History */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Order History ({customerDetail.orders.length})</span>
                        <Link
                          href="/admin/orders"
                          className="text-[#5A805B] hover:underline font-bold text-[11px]"
                        >
                          View in Orders Portal →
                        </Link>
                      </h3>

                      {customerDetail.orders.length === 0 ? (
                        <div className="p-8 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                          No orders recorded for this customer yet.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {customerDetail.orders.map((ord) => (
                            <Link
                              key={ord._id}
                              href={`/admin/orders/${ord._id}`}
                              className="p-3.5 rounded-xl bg-card border border-border hover:border-[#5A805B]/50 transition flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-foreground group-hover:text-[#5A805B] transition">
                                    {ord.orderNumber}
                                  </span>
                                  {getStatusBadge(ord.orderStatus)}
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-1">
                                  <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="capitalize">{ord.fulfillment}</span>
                                  <span>•</span>
                                  <span>{ord.items?.length || 0} items</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="font-extrabold text-xs text-[#5A805B]">
                                  ${ord.total.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                                  <span>Details</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
