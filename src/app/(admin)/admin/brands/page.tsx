"use client";

import * as React from "react";
import Image from "next/image";
import {
  Tag,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BrandItem {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  featured: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt?: string;
}

export default function BrandsManagementPage() {
  const [brands, setBrands] = React.useState<BrandItem[]>([]);
  const [stats, setStats] = React.useState({ totalBrands: 0, activeBrands: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Modal dialog states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<BrandItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    website: "",
    isActive: true,
    featured: false,
    displayOrder: 0,
  });

  // Delete state
  const [deleteBrand, setDeleteBrand] = React.useState<BrandItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchBrands = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/brands?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
        setStats(data.stats || { totalBrands: 0, activeBrands: 0 });
      } else {
        toast.error(data.error || "Failed to load brands");
      }
    } catch {
      toast.error("Failed to connect to brands API");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      slug: "",
      logoUrl: "",
      description: "",
      website: "",
      isActive: true,
      featured: false,
      displayOrder: brands.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: BrandItem) => {
    setEditingBrand(b);
    setFormData({
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl || "",
      description: b.description || "",
      website: b.website || "",
      isActive: b.isActive,
      featured: b.featured,
      displayOrder: b.displayOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingBrand ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Brand name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand._id}` : "/api/admin/brands";
      const method = editingBrand ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingBrand ? "Brand updated!" : "Brand created!");
        setIsModalOpen(false);
        fetchBrands();
      } else {
        toast.error(data.error || "Failed to save brand");
      }
    } catch {
      toast.error("Error saving brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (brand: BrandItem) => {
    try {
      const res = await fetch(`/api/admin/brands/${brand._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !brand.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Brand is now ${!brand.isActive ? "Active" : "Inactive"}`);
        setBrands((prev) =>
          prev.map((b) => (b._id === brand._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteBrand) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/brands/${deleteBrand._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Brand deleted successfully");
        setDeleteBrand(null);
        fetchBrands();
      } else {
        toast.error(data.error || "Failed to delete brand");
      }
    } catch {
      toast.error("Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PermissionGuard permission="brands.view">
      <div className="space-y-6">
        <PageHeader
          title="Brands Management"
          description="Manage catalog brand partners, logos, and product counts"
          actions={
            <Button
              onClick={openCreateModal}
              className="bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#5A805B]/10 text-[#5A805B]">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Brands
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.totalBrands}</p>
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
                  Active Brands
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{stats.activeBrands}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Featured
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {brands.filter((b) => b.featured).length}
                </p>
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
              placeholder="Search brands by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
            />
          </div>
        </div>

        {/* Brands Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400 mb-3">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No brands found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Add your first brand partner to categorize products in the catalog.
              </p>
              <Button
                onClick={openCreateModal}
                className="mt-4 bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs"
              >
                Create Brand
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Products</th>
                    <th className="py-3 px-4">Website</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {brands.map((brand) => (
                    <tr key={brand._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {brand.logoUrl ? (
                            <div className="w-9 h-9 rounded-lg border border-neutral-200 overflow-hidden relative shrink-0 bg-white">
                              <Image
                                src={brand.logoUrl}
                                alt={brand.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 uppercase shrink-0">
                              {brand.name.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{brand.name}</p>
                            {brand.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                                {brand.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {brand.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          <Layers className="w-3 h-3 text-neutral-500" />
                          {brand.productCount || 0} products
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {brand.website ? (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#5A805B] hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Visit
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {brand.featured ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(brand)}
                          className="cursor-pointer"
                        >
                          <StatusBadge variant={brand.isActive ? "success" : "muted"}>
                            {brand.isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(brand)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4 text-neutral-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteBrand(brand)}
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

        {/* Create / Edit Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingBrand ? "Edit Brand" : "Create New Brand"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {editingBrand ? "Update brand partner details" : "Add a brand partner to the catalog"}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Torch, Plume, Wyld"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Slug (URL Key) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. torch, plume"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Official Website</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of this brand..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#5A805B]/30 focus:border-[#5A805B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#5A805B] focus:ring-[#5A805B]"
                    />
                    Active in catalog
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-[#5A805B] focus:ring-[#5A805B]"
                    />
                    Featured Brand
                  </label>
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
                    {isSubmitting ? "Saving..." : editingBrand ? "Save Changes" : "Create Brand"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={Boolean(deleteBrand)}
          onOpenChange={(open) => !open && setDeleteBrand(null)}
          title="Delete Brand"
          description={`Are you sure you want to delete brand "${deleteBrand?.name}"? Existing products associated with this brand will remain intact.`}
          confirmText="Delete Brand"
          isLoading={isDeleting}
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </PermissionGuard>
  );
}
