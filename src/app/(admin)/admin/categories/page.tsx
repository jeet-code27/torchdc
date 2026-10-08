"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  FolderTree,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
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

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: { _id: string; name: string; slug: string } | null;
  image?: {
    url?: string;
    publicId?: string;
    altText?: string;
  };
  displayOrder: number;
  isActive: boolean;
  wooId?: number | string;
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

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data || []);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);


  // Delete category
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    const promise = (async () => {
      const res = await fetch(`/api/admin/categories/${categoryToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete category");
      }
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
      return data;
    })();

    toast.promise(promise, {
      loading: "Deleting category & Cloudinary assets...",
      success: `Category deleted successfully`,
      error: (err) => err.message,
    });

    try {
      await promise;
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns Definition
  const columns: ColumnDef<CategoryItem>[] = [
    {
      accessorKey: "image",
      header: "Media",
      cell: ({ row }) => {
        const item = row.original;
        const imageUrl = item.image?.url;

        return (
          <Link
            href={`/admin/categories/${item._id}`}
            className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center shrink-0 hover:border-primary transition group"
            title="Edit Category Image"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.image?.altText || item.name}
                width={40}
                height={40}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            )}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => {
        const item = row.original;
        const isChild = Boolean(item.parentId);

        return (
          <div className="py-1">
            <Link
              href={`/admin/categories/${item._id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              {isChild && <span className="text-muted-foreground text-xs font-mono">↳</span>}
              <span>{item.name}</span>
            </Link>
            <div className="text-[11px] text-muted-foreground font-mono">
              /category/{item.slug}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "parentId",
      header: "Hierarchy",
      cell: ({ row }) => {
        const parent = row.original.parentId;
        if (!parent) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-muted/60 text-foreground border border-border">
              <Layers className="w-3 h-3 text-primary" />
              <span>Top-Level</span>
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-accent text-accent-foreground border border-accent">
            <span className="text-muted-foreground">Parent:</span>
            <strong>{parent.name}</strong>
          </span>
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
          <div className="flex flex-col gap-1 py-1">
            <div className="flex items-center gap-1.5">
              {isOptimized ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Optimized</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                  <AlertTriangle className="w-3 h-3" />
                  <span>SEO Incomplete</span>
                </span>
              )}
              <span className="text-muted-foreground text-[10px]">•</span>
              <span className="text-[10px] text-muted-foreground">
                {isIndexed ? "Index" : "Noindex"}
              </span>
            </div>
            {seo?.focusKeyword && (
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
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
          <StatusBadge variant={active ? "success" : "muted"} dot>
            {active ? "Active" : "Hidden"}
          </StatusBadge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const cat = row.original;

        return (
          <div className="flex justify-end pr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  aria-label="Category actions menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <Can permission="categories.edit" fallback={
                  <Can permission="categories.seo">
                    <DropdownMenuItem
                      onClick={() => router.push(`/admin/categories/${cat._id}`)}
                    >
                      <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                      <span>Edit SEO Meta Tags</span>
                    </DropdownMenuItem>
                  </Can>
                }>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/categories/${cat._id}`)}
                  >
                    <Edit className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                    <span>Edit Category & SEO</span>
                  </DropdownMenuItem>
                </Can>

                <DropdownMenuSeparator />

                <Can permission="categories.delete">
                  <DropdownMenuItem
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete Category</span>
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
    <PermissionGuard permission="categories.view">
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Header */}
        <PageHeader
          title="Categories"
          description="Manage store category tree, Cloudinary image assets, and Google SEO indexing."
          actions={
            <div className="flex items-center gap-2">
              <Can permission="categories.create">
                <Button
                  onClick={() => router.push("/admin/categories/new")}
                  className="text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Add Category</span>
                </Button>
              </Can>
            </div>
          }
        />

        {/* Categories Table */}
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories by name..."
          isLoading={isLoading}
          emptyMessage="No categories created yet. Click 'Add Category' to create one."
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Category"
          description={`Are you sure you want to delete "${categoryToDelete?.name}"? Any uploaded Cloudinary images will also be removed automatically.`}
          confirmText="Delete Category"
          variant="destructive"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </PermissionGuard>
  );
}
