"use client";

import * as React from "react";
import {
  Award,
  Sparkles,
  Search,
  Plus,
  Minus,
  Coins,
  Crown,
  History,
  TrendingUp,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

interface LoyaltyHistoryItem {
  type: "earned" | "redeemed" | "adjustment";
  points: number;
  description: string;
  createdAt: string;
}

interface LoyaltyMemberItem {
  _id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  history: LoyaltyHistoryItem[];
  createdAt?: string;
}

export default function LoyaltyProgramPage() {
  const [members, setMembers] = React.useState<LoyaltyMemberItem[]>([]);
  const [stats, setStats] = React.useState({
    totalMembers: 0,
    totalPointsInCirculation: 0,
    totalLifetimeEarned: 0,
    tierCounts: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 },
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState<string>("all");

  // Adjustment modal state
  const [adjustModalOpen, setAdjustModalOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<LoyaltyMemberItem | null>(null);
  const [adjustPoints, setAdjustPoints] = React.useState<number>(50);
  const [adjustReason, setAdjustReason] = React.useState("Customer appreciation credit");
  const [adjustTier, setAdjustTier] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // History slideout modal
  const [historyModalOpen, setHistoryModalOpen] = React.useState(false);

  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/loyalty?search=${encodeURIComponent(search)}&tier=${tierFilter}`
      );
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setStats(data.stats || {
          totalMembers: 0,
          totalPointsInCirculation: 0,
          totalLifetimeEarned: 0,
          tierCounts: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 },
        });
      } else {
        toast.error(data.error || "Failed to load loyalty members");
      }
    } catch {
      toast.error("Failed to connect to loyalty API");
    } finally {
      setIsLoading(false);
    }
  }, [search, tierFilter]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openAdjustDialog = (member: LoyaltyMemberItem) => {
    setSelectedMember(member);
    setAdjustPoints(50);
    setAdjustReason("Customer appreciation credit");
    setAdjustTier(member.tier);
    setAdjustModalOpen(true);
  };

  const openHistoryDialog = (member: LoyaltyMemberItem) => {
    setSelectedMember(member);
    setHistoryModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember._id,
          pointsDelta: adjustPoints,
          reason: adjustReason,
          newTier: adjustTier,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Points updated for ${selectedMember.customerName}!`);
        setAdjustModalOpen(false);
        fetchMembers();
      } else {
        toast.error(data.error || "Failed to adjust points");
      }
    } catch {
      toast.error("Error submitting points adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Gold":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Silver":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  return (
    <PermissionGuard permission="loyalty.view">
      <div className="space-y-6">
        <PageHeader
          title="Loyalty & Rewards Program"
          description="Reward repeat Washington D.C. customers with points, cashback tiers, and exclusive perks"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#5A805B]/10 text-[#5A805B]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Points in Circulation
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {stats.totalPointsInCirculation.toLocaleString()} pts
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Lifetime Earned
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {stats.totalLifetimeEarned.toLocaleString()} pts
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Platinum VIPs
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {stats.tierCounts.Platinum} members
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-800">Bronze Tier</span>
              <span className="text-xs font-bold text-orange-600">{stats.tierCounts.Bronze}</span>
            </div>
            <p className="text-[11px] text-orange-700">1x Point per $1 spent • $0–$250 lifetime</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Silver Tier</span>
              <span className="text-xs font-bold text-slate-600">{stats.tierCounts.Silver}</span>
            </div>
            <p className="text-[11px] text-slate-700">1.25x Points per $1 spent • $250+ spend</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Gold Tier</span>
              <span className="text-xs font-bold text-amber-700">{stats.tierCounts.Gold}</span>
            </div>
            <p className="text-[11px] text-amber-800">1.5x Points + Free Pre-Roll • $600+ spend</p>
          </div>

          <div className="p-3.5 rounded-xl border border-purple-300 bg-purple-50/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">Platinum Tier</span>
              <span className="text-xs font-bold text-purple-700">{stats.tierCounts.Platinum}</span>
            </div>
            <p className="text-[11px] text-purple-800">2x Points + VIP Priority • $1,200+ spend</p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
            {["all", "Bronze", "Silver", "Gold", "Platinum"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  tierFilter === t ? "bg-white text-neutral-900 shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading loyalty members...</div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground">No loyalty members found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Customers automatically earn points on every completed delivery order.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">VIP Tier</th>
                    <th className="py-3 px-4">Available Points</th>
                    <th className="py-3 px-4">Estimated Value</th>
                    <th className="py-3 px-4">Lifetime Earned</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => {
                    const dollarValue = (m.pointsBalance * 0.05).toFixed(2);
                    return (
                      <tr key={m._id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {m.customerName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{m.customerName}</p>
                              <p className="text-xs text-muted-foreground">{m.customerEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground">
                          {m.customerPhone || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTierColor(
                              m.tier
                            )}`}
                          >
                            <Crown className="w-3 h-3" />
                            {m.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-foreground font-mono text-sm">
                            {m.pointsBalance.toLocaleString()} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-emerald-600">
                          ${dollarValue} off
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                          {m.lifetimePointsEarned.toLocaleString()} pts
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openHistoryDialog(m)}
                              className="text-xs h-8 px-2.5 flex items-center gap-1"
                            >
                              <History className="w-3.5 h-3.5 text-neutral-500" />
                              Log
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openAdjustDialog(m)}
                              className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs h-8 px-2.5"
                            >
                              Adjust
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Adjust Points Modal */}
        {adjustModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Adjust Loyalty Points</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For {selectedMember.customerName} ({selectedMember.customerEmail})
                  </p>
                </div>
                <button
                  onClick={() => setAdjustModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">
                    {selectedMember.pointsBalance} pts
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Points Delta (+ to add, - to deduct) *
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustPoints}
                    onChange={(e) => setAdjustPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    New balance will be:{" "}
                    <strong>{Math.max(0, selectedMember.pointsBalance + adjustPoints)} pts</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">VIP Tier Override</label>
                  <select
                    value={adjustTier}
                    onChange={(e) => setAdjustTier(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  >
                    <option value="Bronze">Bronze (Standard)</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum VIP</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Reason / Note *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compensation for delivery delay, Holiday bonus"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdjustModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-medium"
                  >
                    {isSubmitting ? "Updating..." : "Save Points Adjustment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Slideout Modal */}
        {historyModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Loyalty Points History</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedMember.customerName} • {selectedMember.customerEmail}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                {selectedMember.history?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No points activity recorded yet.</p>
                ) : (
                  selectedMember.history
                    ?.slice()
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-neutral-900">{item.description}</p>
                          <p className="text-[11px] text-neutral-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            item.points >= 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </div>
                    ))
                )}
              </div>

              <div className="px-6 py-3 border-t border-border bg-neutral-50 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
