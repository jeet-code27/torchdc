"use client";

import * as React from "react";
import {
  Activity,
  Shield,
  Search,
  ShoppingCart,
  Package,
  KeyRound,
  FileText,
  UserCheck,
  Server,
  Clock,
  Globe,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";

interface ActivityItem {
  _id: string;
  action: string;
  description: string;
  actor: {
    userId?: string;
    name: string;
    email: string;
    role: string;
  };
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = React.useState<ActivityItem[]>([]);
  const [stats, setStats] = React.useState({
    totalEvents: 0,
    orderEvents: 0,
    catalogEvents: 0,
    securityEvents: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/activity?search=${encodeURIComponent(search)}&entityType=${selectedType}`
      );
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || {
          totalEvents: 0,
          orderEvents: 0,
          catalogEvents: 0,
          securityEvents: 0,
        });
      } else {
        toast.error(data.error || "Failed to load activity logs");
      }
    } catch {
      toast.error("Failed to connect to activity logs API");
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedType]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith("order")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.startsWith("coupon")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (action.startsWith("product")) return "bg-amber-100 text-amber-700 border-amber-200";
    if (action.startsWith("staff")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-neutral-100 text-neutral-700 border-neutral-200";
  };

  const getEntityIcon = (type?: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case "product":
        return <Package className="w-4 h-4 text-amber-500" />;
      case "coupon":
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case "staff":
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <Server className="w-4 h-4 text-neutral-500" />;
    }
  };

  return (
    <PermissionGuard permission="activity.view">
      <div className="space-y-6">
        <PageHeader
          title="Activity Log & Audit Trail"
          description="Real-time audit log of staff actions, order status changes, and catalog updates"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#5A805B]/10 text-[#5A805B]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Order Actions
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.orderEvents}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Catalog Updates
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.catalogEvents}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Staff & Security
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.securityEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold overflow-x-auto max-w-full">
            {[
              { key: "all", label: "All Events" },
              { key: "order", label: "Orders" },
              { key: "product", label: "Products" },
              { key: "coupon", label: "Coupons" },
              { key: "staff", label: "Staff & Auth" },
              { key: "system", label: "System" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedType === t.key
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading audit log...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground">No events recorded</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                All staff operations and state transitions are captured automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Activity Description</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {log.actor?.name?.slice(0, 2) || "AD"}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-foreground">
                              {log.actor?.name}
                            </p>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              {log.actor?.role?.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          {getEntityIcon(log.entityType)}
                          <span className="font-mono text-xs">{log.entityId || log.entityType || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-foreground font-medium max-w-md">
                        {log.description}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                        {log.ipAddress || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
