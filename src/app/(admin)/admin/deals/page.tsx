"use client";

import * as React from "react";
import {
  Tag,
  Percent,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Calendar,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Flame,
  Clock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface CouponItem {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed_amount" | "free_delivery";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

interface DealsStats {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
}

export default function DealsAdminPage() {
  const [coupons, setCoupons] = React.useState<CouponItem[]>([]);
  const [stats, setStats] = React.useState<DealsStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<CouponItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form Fields
  const [formCode, setFormCode] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formType, setFormType] = React.useState<"percentage" | "fixed_amount" | "free_delivery">("percentage");
  const [formValue, setFormValue] = React.useState<number>(10);
  const [formMinOrder, setFormMinOrder] = React.useState<number>(0);
  const [formMaxDiscount, setFormMaxDiscount] = React.useState<string>("");
  const [formEndDate, setFormEndDate] = React.useState<string>("");
  const [formUsageLimit, setFormUsageLimit] = React.useState<string>("");
  const [formIsActive, setFormIsActive] = React.useState<boolean>(true);

  const loadDeals = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/deals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || "Failed to load deals");
      }
    } catch {
      toast.error("Network error loading deals");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormDescription("");
    setFormType("percentage");
    setFormValue(10);
    setFormMinOrder(0);
    setFormMaxDiscount("");
    setFormEndDate("");
    setFormUsageLimit("");
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormDescription(c.description || "");
    setFormType(c.discountType);
    setFormValue(c.discountValue);
    setFormMinOrder(c.minOrderAmount || 0);
    setFormMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : "");
    setFormEndDate(c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "");
    setFormUsageLimit(c.usageLimit ? String(c.usageLimit) : "");
    setFormIsActive(c.isActive);
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      toast.error("Please provide a coupon code");
      return;
    }
    if (formValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        discountType: formType,
        discountValue: formValue,
        minOrderAmount: formMinOrder,
        maxDiscount: formMaxDiscount ? Number(formMaxDiscount) : undefined,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
        usageLimit: formUsageLimit ? Number(formUsageLimit) : undefined,
        isActive: formIsActive,
      };

      const url = editingCoupon ? `/api/admin/deals/${editingCoupon._id}` : "/api/admin/deals";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingCoupon ? "Deal updated successfully" : "Coupon created successfully");
        setModalOpen(false);
        loadDeals();
      } else {
        toast.error(data.error || "Failed to save deal");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (c: CouponItem) => {
    try {
      const res = await fetch(`/api/admin/deals/${c._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon ${c.code} ${!c.isActive ? "activated" : "deactivated"}`);
        loadDeals();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (c: CouponItem) => {
    if (!confirm(`Are you sure you want to delete coupon "${c.code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/deals/${c._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon ${c.code} deleted`);
        loadDeals();
      } else {
        toast.error(data.error || "Failed to delete coupon");
      }
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard`);
  };

  return (
    <PermissionGuard permission="deals.view">
      <div className="space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Deals & Promotional Coupons</span>
              <Flame className="w-6 h-6 text-[#E8561E]" />
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configure promo codes, percentage discounts, minimum order requirements, and flash sales.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadDeals()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Active Coupons</div>
              <div className="text-2xl font-extrabold text-[#5A805B]">
                {stats.activeCoupons}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Out of {stats.totalCoupons} total campaigns
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8561E]/15 text-[#E8561E] flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Total Redemptions</div>
              <div className="text-2xl font-extrabold text-foreground">
                {stats.totalRedemptions}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Times coupons applied at checkout
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#5A805B]" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Popular Deals</div>
              <div className="text-sm font-bold text-foreground">
                Half Oz Hustle · Wake & Bake
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Free DC Delivery eligible
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Status Filter */}
        <div className="bg-card rounded-2xl p-3 sm:p-4 border border-border shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code (e.g. TORCH10)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B] transition"
            />
          </div>

          <div className="inline-flex p-1 rounded-xl bg-muted border border-border text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "all"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({stats.totalCoupons})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "active"
                  ? "bg-card text-foreground shadow-xs font-bold text-[#5A805B]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({stats.activeCoupons})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === "inactive"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Uses</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="w-6 h-6 border-2 border-[#5A805B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading coupons...</span>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">No coupons found</p>
                      <button
                        onClick={openCreateModal}
                        className="text-xs text-[#5A805B] font-bold hover:underline"
                      >
                        + Create your first promotional deal
                      </button>
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.endDate && new Date(c.endDate) < new Date();

                    return (
                      <tr key={c._id} className="hover:bg-muted/40 transition">
                        {/* Coupon Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-foreground px-2.5 py-1 rounded-lg bg-muted border border-border">
                              {c.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(c.code)}
                              className="text-muted-foreground hover:text-foreground p-1 rounded"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {c.description && (
                            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs truncate">
                              {c.description}
                            </p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-[#5A805B] text-sm">
                            {c.discountType === "percentage"
                              ? `${c.discountValue}% OFF`
                              : c.discountType === "fixed_amount"
                              ? `$${c.discountValue.toFixed(2)} OFF`
                              : "FREE DELIVERY"}
                          </span>
                          {c.maxDiscount ? (
                            <p className="text-[10px] text-muted-foreground">
                              Max discount: ${c.maxDiscount}
                            </p>
                          ) : null}
                        </td>

                        {/* Min Spend */}
                        <td className="py-3.5 px-4">
                          {c.minOrderAmount && c.minOrderAmount > 0 ? (
                            <span className="font-medium text-foreground">
                              ${c.minOrderAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">No minimum</span>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="py-3.5 px-4 text-xs">
                          {c.endDate ? (
                            <div className={isExpired ? "text-rose-600 font-bold" : "text-foreground font-medium"}>
                              {isExpired ? "Expired" : "Expires"}: {new Date(c.endDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-medium">Never expires</span>
                          )}
                        </td>

                        {/* Uses */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-foreground">{c.usageCount}</span>
                          {c.usageLimit ? (
                            <span className="text-muted-foreground text-xs"> / {c.usageLimit}</span>
                          ) : null}
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              c.isActive && !isExpired
                                ? "bg-[#5A805B]/15 text-[#5A805B] border border-[#5A805B]/30 hover:bg-[#5A805B]/25"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.isActive && !isExpired ? "bg-[#5A805B]" : "bg-zinc-400"
                              }`}
                            />
                            <span>{c.isActive && !isExpired ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Coupon Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon Deal"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Promotions are applied at customer checkout or cart.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Coupon Code (e.g. TORCH10, HALFOZ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="TORCH10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background font-mono font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Description / Public Note
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="10% off for first-time Washington DC buyers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Discount Type
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount ($)</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      {formType === "percentage" ? "Discount Value (%) *" : "Discount Value ($) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formType === "percentage" ? 100 : 1000}
                      value={formValue}
                      onChange={(e) => setFormValue(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Min Order Subtotal ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMinOrder}
                      onChange={(e) => setFormMinOrder(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Max Cap ($) (Optional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMaxDiscount}
                      onChange={(e) => setFormMaxDiscount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    />
                  </div>
                </div>

                {/* Expiry Date & Usage Limit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Usage Limit (Total)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(e.target.value)}
                      placeholder="Unlimited"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5A805B]"
                    />
                  </div>
                </div>

                {/* Active Switch */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCoupon"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5A805B] accent-[#5A805B] cursor-pointer"
                  />
                  <label htmlFor="isActiveCoupon" className="text-xs font-bold text-foreground cursor-pointer">
                    Enable and activate this coupon immediately
                  </label>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#5A805B] hover:bg-[#4d704e] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingCoupon ? "Update Deal" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
