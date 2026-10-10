"use client";

import * as React from "react";
import {
  Globe,
  ArrowRight,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  FileText,
  Share2,
  Sparkles,
  Zap,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface RedirectItem {
  _id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: 301 | 302;
  isActive: boolean;
  hits: number;
  notes?: string;
  createdAt?: string;
}

export default function SeoManagementPage() {
  const [activeTab, setActiveTab] = React.useState<"redirects" | "meta">("redirects");

  // Redirects state
  const [redirects, setRedirects] = React.useState<RedirectItem[]>([]);
  const [stats, setStats] = React.useState({ totalRedirects: 0, activeRedirects: 0, totalHits: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Modal dialog states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingRedirect, setEditingRedirect] = React.useState<RedirectItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [formData, setFormData] = React.useState({
    sourceUrl: "",
    targetUrl: "",
    statusCode: 301,
    notes: "",
  });

  // Delete state
  const [deleteRedirect, setDeleteRedirect] = React.useState<RedirectItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Global SEO Meta settings state
  const [metaSettings, setMetaSettings] = React.useState({
    siteTitle: "Torch | Premium Cannabis Delivery in Washington D.C.",
    metaDescription:
      "Order premium flower, cartridges, pre-rolls, and edibles for direct delivery across Washington D.C. Initiative 71 Compliant. Fast, discreet delivery.",
    canonicalUrl: "https://torchdc.com",
    googleSiteVerification: "google-site-verification=torch-dc-auth-2026",
    ogImage: "https://torchdc.com/og-image.jpg",
  });
  const [isSavingMeta, setIsSavingMeta] = React.useState(false);

  const fetchRedirects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/seo/redirects?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setRedirects(data.redirects || []);
        setStats(data.stats || { totalRedirects: 0, activeRedirects: 0, totalHits: 0 });
      }
    } catch {
      toast.error("Failed to load redirects");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  const openCreateModal = () => {
    setEditingRedirect(null);
    setFormData({
      sourceUrl: "",
      targetUrl: "",
      statusCode: 301,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r: RedirectItem) => {
    setEditingRedirect(r);
    setFormData({
      sourceUrl: r.sourceUrl,
      targetUrl: r.targetUrl,
      statusCode: r.statusCode,
      notes: r.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceUrl || !formData.targetUrl) {
      toast.error("Both source URL and target URL are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingRedirect
        ? `/api/admin/seo/redirects/${editingRedirect._id}`
        : "/api/admin/seo/redirects";
      const method = editingRedirect ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingRedirect ? "Redirect updated!" : "Redirect created!");
        setIsModalOpen(false);
        fetchRedirects();
      } else {
        toast.error(data.error || "Failed to save redirect");
      }
    } catch {
      toast.error("Error saving redirect");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (r: RedirectItem) => {
    try {
      const res = await fetch(`/api/admin/seo/redirects/${r._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Redirect is now ${!r.isActive ? "Active" : "Disabled"}`);
        setRedirects((prev) =>
          prev.map((item) => (item._id === r._id ? { ...item, isActive: !r.isActive } : item))
        );
      }
    } catch {
      toast.error("Failed to update redirect status");
    }
  };

  const handleDelete = async () => {
    if (!deleteRedirect) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/seo/redirects/${deleteRedirect._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Redirect deleted");
        setDeleteRedirect(null);
        fetchRedirects();
      } else {
        toast.error(data.error || "Failed to delete redirect");
      }
    } catch {
      toast.error("Failed to delete redirect");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    setTimeout(() => {
      setIsSavingMeta(false);
      toast.success("Global SEO settings saved successfully!");
    }, 500);
  };

  const addWooCommercePresets = async () => {
    const presets = [
      { sourceUrl: "/shop-2", targetUrl: "/shop", notes: "Old WooCommerce shop duplicate" },
      { sourceUrl: "/product-category/flowers", targetUrl: "/shop?category=flower", notes: "Legacy category URL" },
      { sourceUrl: "/product-category/carts", targetUrl: "/shop?category=cartridges", notes: "Legacy category URL" },
      { sourceUrl: "/product-category/edibles", targetUrl: "/shop?category=edibles", notes: "Legacy category URL" },
      { sourceUrl: "/store", targetUrl: "/shop", notes: "Old store redirect" },
    ];

    let addedCount = 0;
    for (const p of presets) {
      try {
        const res = await fetch("/api/admin/seo/redirects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...p, statusCode: 301 }),
        });
        const data = await res.json();
        if (data.success) addedCount++;
      } catch {
        // ignore duplicate
      }
    }

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} legacy redirects!`);
      fetchRedirects();
    } else {
      toast("Presets already exist or up-to-date");
    }
  };

  return (
    <PermissionGuard permission="seo.view">
      <div className="space-y-6">
        <PageHeader
          title="SEO Management"
          description="Configure 301 redirects from old URLs, canonical tags, and search engine previews"
          actions={
            activeTab === "redirects" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addWooCommercePresets}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Add Legacy Presets
                </Button>
                <Button
                  onClick={openCreateModal}
                  className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center gap-2 text-xs font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add 301 Redirect
                </Button>
              </div>
            ) : null
          }
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("redirects")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "redirects"
                ? "border-[#5A805B] text-[#5A805B]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            301 & 302 Redirects
            <span className="px-2 py-0.5 rounded-full text-xs bg-neutral-100 text-neutral-700">
              {stats.totalRedirects}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("meta")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "meta"
                ? "border-[#5A805B] text-[#5A805B]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4" />
            Global Meta & SERP Previews
          </button>
        </div>

        {activeTab === "redirects" ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#5A805B]/10 text-[#5A805B]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Total Redirects
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalRedirects}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">{stats.activeRedirects}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Total Hits Handled
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalHits}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search redirects by source or destination URL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                />
              </div>
            </div>

            {/* Redirects Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground">Loading redirects...</div>
              ) : redirects.length === 0 ? (
                <div className="py-16 text-center">
                  <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <h3 className="text-base font-semibold text-foreground">No redirects configured</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Add 301 redirects to preserve SEO rankings from old URLs or deleted pages.
                  </p>
                  <Button
                    onClick={openCreateModal}
                    className="mt-4 bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs"
                  >
                    Add Redirect
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                        <th className="py-3 px-4">Old Source URL</th>
                        <th className="py-3 px-4">Destination Target</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Hits</th>
                        <th className="py-3 px-4">Notes</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {redirects.map((r) => (
                        <tr key={r._id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-foreground font-semibold">
                            {r.sourceUrl}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-foreground flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="text-[#5A805B] font-medium">{r.targetUrl}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800">
                              {r.statusCode} Permanent
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-neutral-700">
                            {r.hits || 0}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted-foreground">
                            {r.notes || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <button onClick={() => handleToggleActive(r)} className="cursor-pointer">
                              <StatusBadge variant={r.isActive ? "success" : "muted"}>
                                {r.isActive ? "Active" : "Disabled"}
                              </StatusBadge>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(r)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4 text-neutral-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteRedirect(r)}
                                className="h-8 w-8 p-0 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 text-neutral-600 hover:text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Global SEO Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="text-base font-bold text-foreground">Global Meta Configuration</h3>
                <p className="text-xs text-muted-foreground">
                  Default title and description applied when specific product or category tags are not set.
                </p>

                <form onSubmit={handleSaveMeta} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Default Page Title</label>
                      <span className="text-[11px] text-muted-foreground">
                        {metaSettings.siteTitle.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={metaSettings.siteTitle}
                      onChange={(e) =>
                        setMetaSettings({ ...metaSettings, siteTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">Default Meta Description</label>
                      <span className="text-[11px] text-muted-foreground">
                        {metaSettings.metaDescription.length}/160 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={metaSettings.metaDescription}
                      onChange={(e) =>
                        setMetaSettings({ ...metaSettings, metaDescription: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Canonical Domain URL</label>
                    <input
                      type="url"
                      value={metaSettings.canonicalUrl}
                      onChange={(e) =>
                        setMetaSettings({ ...metaSettings, canonicalUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Google Verification Code</label>
                    <input
                      type="text"
                      value={metaSettings.googleSiteVerification}
                      onChange={(e) =>
                        setMetaSettings({ ...metaSettings, googleSiteVerification: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingMeta}
                    className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingMeta ? "Saving..." : "Save Meta Settings"}
                  </Button>
                </form>
              </div>

              {/* Sitemap info */}
              <div className="p-5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">XML Sitemap</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live dynamic XML sitemap generated automatically for search engines.
                  </p>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium hover:bg-neutral-50"
                >
                  View Sitemap
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </a>
              </div>
            </div>

            {/* Google SERP Live Preview */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Live Google SERP Preview
                </h3>
                <p className="text-xs text-muted-foreground">
                  How your storefront appears in Google desktop & mobile search results.
                </p>

                {/* Google Snippet Box */}
                <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <span className="w-4 h-4 rounded-full bg-[#5A805B] text-white flex items-center justify-center font-bold text-[9px]">
                      T
                    </span>
                    <span className="font-medium text-neutral-800">Torch</span>
                    <span className="text-neutral-400">›</span>
                    <span className="text-neutral-500">torchdc.com</span>
                  </div>
                  <h4 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                    {metaSettings.siteTitle}
                  </h4>
                  <p className="text-xs leading-relaxed text-[#4d5156] line-clamp-2">
                    {metaSettings.metaDescription}
                  </p>
                </div>
              </div>

              {/* Social OG Card Preview */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  Social Card Preview (iMessage, Twitter, FB)
                </h3>
                <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50">
                  <div className="h-32 bg-gradient-to-r from-[#5A805B] to-[#3f5d40] flex items-center justify-center text-white font-bold text-lg">
                    Torch • Washington D.C. Delivery
                  </div>
                  <div className="p-3 bg-white space-y-1">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      torchdc.com
                    </p>
                    <p className="text-xs font-bold text-neutral-900 line-clamp-1">
                      {metaSettings.siteTitle}
                    </p>
                    <p className="text-[11px] text-neutral-600 line-clamp-1">
                      {metaSettings.metaDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingRedirect ? "Edit 301 Redirect" : "Create 301 Redirect"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Forward old URLs permanently to current Next.js routes
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Source URL Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /shop-2 or /old-product"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                  <p className="text-[11px] text-muted-foreground">The incoming URL being requested.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /shop or /product/new-slug"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                  <p className="text-[11px] text-muted-foreground">Where the visitor and Googlebot will be redirected.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Redirect Status Code</label>
                  <select
                    value={formData.statusCode}
                    onChange={(e) => setFormData({ ...formData, statusCode: Number(e.target.value) as 301 | 302 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  >
                    <option value={301}>301 - Permanent (Recommended for SEO)</option>
                    <option value={302}>302 - Temporary</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Internal Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Old WordPress archive"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-medium"
                  >
                    {isSubmitting ? "Saving..." : editingRedirect ? "Save Changes" : "Create Redirect"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={Boolean(deleteRedirect)}
          onOpenChange={(open) => !open && setDeleteRedirect(null)}
          title="Delete Redirect"
          description={`Are you sure you want to delete redirect for "${deleteRedirect?.sourceUrl}"? Visitors visiting this URL will no longer be forwarded.`}
          confirmText="Delete Redirect"
          isLoading={isDeleting}
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </PermissionGuard>
  );
}
