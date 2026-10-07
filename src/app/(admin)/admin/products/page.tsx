"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Package,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Star,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Can } from "@/components/auth/can";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  brand?: string;
  type: "simple" | "variable";
  price: number;
  salePrice?: number | null;
  stock: number;
  inStock: boolean;
  featured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isActive: boolean;
  variants?: Array<{
    name: string;
    price: number;
    salePrice?: number | null;
    stock?: number;
    inStock: boolean;
  }>;
  categoryIds?: Array<{ _id: string; name: string; slug: string }>;
  images?: Array<{ url: string; isPrimary?: boolean; altText?: string }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    metaRobotsIndex: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = React.useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filter states
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [selectedStock, setSelectedStock] = React.useState<string>("all");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // WooCommerce CSV Sync
  const handleImportWooCommerce = async () => {
    const toastId = toast.loading("Syncing products from WooCommerce CSV...");
    try {
      const res = await fetch("/api/admin/products/import-csv", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Products synced successfully!", { id: toastId });
        fetchProducts();
      } else {
        toast.error(json.error || "Failed to sync products from CSV", { id: toastId });
      }
    } catch {
      toast.error("Unexpected error during CSV import", { id: toastId });
    }
  };

  // Delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Product deleted");
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error(json.error || "Failed to delete product");
      }
    } catch {
      toast.error("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter products locally for instant response
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (selectedType !== "all" && p.type !== selectedType) return false;
      if (selectedStatus === "active" && !p.isActive) return false;
      if (selectedStatus === "draft" && p.isActive) return false;
      if (selectedStock === "inStock" && !p.inStock) return false;
      if (selectedStock === "outOfStock" && p.inStock) return false;
      return true;
    });
  }, [products, selectedType, selectedStatus, selectedStock]);

  // Table Columns Definition
  const columns: ColumnDef<ProductItem>[] = [
    {
      accessorKey: "images",
      header: "Media",
      cell: ({ row }) => {
        const item = row.original;
        const primaryImg =
          item.images?.find((i) => i.isPrimary) || item.images?.[0];

        return (
          <Link
            href={`/admin/products/${item._id}`}
            className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center shrink-0 hover:border-primary transition group"
            title="Edit Product"
          >
            {primaryImg?.url ? (
              <Image
                src={primaryImg.url}
                alt={primaryImg.altText || item.name}
                width={48}
                height={48}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            )}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="py-1 max-w-xs sm:max-w-sm">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/admin/products/${item._id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {item.name}
              </Link>
              {item.featured && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Featured
                </span>
              )}
              {item.isBestSeller && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  🔥 Best Seller
                </span>
              )}
              {item.isNewArrival && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ✨ New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
              <span>/product/{item.slug}</span>
              {item.brand && (
                <>
                  <span>•</span>
                  <span className="font-sans font-medium text-foreground">{item.brand}</span>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type & Sizes",
      cell: ({ row }) => {
        const item = row.original;
        const isVariable = item.type === "variable";
        const variantCount = item.variants?.length || 0;

        return (
          <div className="py-1">
            {isVariable ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                <Layers className="w-3 h-3" />
                <span>{variantCount} Variant{variantCount !== 1 ? "s" : ""}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                <span>Simple</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Pricing",
      cell: ({ row }) => {
        const item = row.original;

        if (item.type === "variable" && item.variants && item.variants.length > 0) {
          const prices = item.variants.map((v) => v.salePrice || v.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return (
            <div className="py-1 font-mono text-xs font-semibold text-foreground">
              {min === max ? `$${min}` : `$${min} - $${max}`}
            </div>
          );
        }

        const isSale = Boolean(item.salePrice && item.salePrice < item.price);

        return (
          <div className="py-1 font-mono text-xs">
            {isSale ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${item.salePrice}
                </span>
                <span className="text-[11px] line-through text-muted-foreground">
                  ${item.price}
                </span>
              </div>
            ) : (
              <span className="font-semibold text-foreground">${item.price}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "inStock",
      header: "Inventory",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="py-1">
            {item.inStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>In Stock ({item.stock})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span>Out of Stock</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryIds",
      header: "Categories",
      cell: ({ row }) => {
        const cats = row.original.categoryIds || [];
        if (cats.length === 0) {
          return <span className="text-[11px] text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[170px] py-1">
            {cats.slice(0, 2).map((c) => (
              <span
                key={c._id}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border truncate"
              >
                {c.name}
              </span>
            ))}
            {cats.length > 2 && (
              <span className="text-[10px] px-1 py-0.5 text-muted-foreground">
                +{cats.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "seo",
      header: "SEO Status",
      cell: ({ row }) => {
        const seo = row.original.seo;
        const hasTitle = Boolean(seo?.metaTitle);
        const hasDesc = Boolean(seo?.metaDescription);
        const isIndexed = seo?.metaRobotsIndex ?? true;
        const isOptimized = hasTitle && hasDesc;

        return (
          <div className="flex flex-col gap-0.5 py-1">
            <div className="flex items-center gap-1.5">
              {isOptimized ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Rank Ready</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Partial SEO</span>
                </span>
              )}
              <span className="text-muted-foreground text-[10px]">•</span>
              <span className="text-[10px] text-muted-foreground">
                {isIndexed ? "Index" : "Noindex"}
              </span>
            </div>
            {seo?.focusKeyword && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                KW: &quot;{seo.focusKeyword}&quot;
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <StatusBadge variant={active ? "success" : "muted"}>
            {active ? "Active" : "Draft"}
          </StatusBadge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const prod = row.original;

        return (
          <div className="flex justify-end pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Product actions menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <Can permission="products.edit" fallback={
                  <Can permission="products.seo">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/products/${prod._id}`)}
                    >
                      <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                      <span>Edit SEO Meta Tags</span>
                    </DropdownMenuItem>
                  </Can>
                }>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/products/${prod._id}`)}
                  >
                    <Edit className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                    <span>Edit Product</span>
                  </DropdownMenuItem>
                </Can>

                <DropdownMenuSeparator />

                <Can permission="products.delete">
                  <DropdownMenuItem
                    onClick={() => {
                      setProductToDelete(prod);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete Product</span>
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <PermissionGuard permission="products.view">
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Header */}
        <PageHeader
          title="Products"
          description="Manage inventory, variable sizes, pricing, Cloudinary media gallery, and Google SERP rankings."
          actions={
            <div className="flex items-center gap-2">
              <Can permission="products.create">
                <Button
                  variant="outline"
                  onClick={handleImportWooCommerce}
                  className="text-xs"
                >
                  <UploadCloud className="w-4 h-4 mr-1 text-primary" />
                  <span>Sync WooCommerce CSV</span>
                </Button>

                <Button
                  onClick={() => router.push("/admin/products/new")}
                  className="text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add Product</span>
                </Button>
              </Can>
            </div>
          }
        />

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-3.5 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="simple">Simple</option>
              <option value="variable">Variable</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Stock:</span>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-muted-foreground font-mono">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Products Table */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          searchKey="name"
          searchPlaceholder="Search products by title..."
          isLoading={isLoading}
          emptyMessage="No products found. Click 'Sync WooCommerce CSV' or 'Add Product'."
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Product"
          description={`Are you sure you want to delete "${productToDelete?.name}"? Any attached Cloudinary images will also be removed automatically.`}
          confirmText="Delete Product"
          variant="destructive"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PermissionGuard>
  );
}
