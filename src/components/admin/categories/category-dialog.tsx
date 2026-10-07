"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Loader2,
  FolderTree,
  Globe,
  Upload,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  image?: {
    url: string;
    publicId?: string;
    altText?: string;
  };
  displayOrder: number;
  isActive: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    metaRobotsIndex: boolean;
  };
  createdAt: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: CategoryItem | null;
  allCategories: CategoryItem[];
  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  allCategories,
  onSuccess,
}: CategoryDialogProps) {
  const { hasPermission, role } = usePermissions();
  const [activeTab, setActiveTab] = React.useState<"general" | "image" | "seo">("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const isEditing = Boolean(categoryToEdit);
  const canEditFull = role === "super_admin" || hasPermission("categories.edit") || hasPermission("categories.create");
  const isSeoOnly = hasPermission("categories.seo") && !canEditFull;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      displayOrder: 0,
      isActive: true,
      image: {
        url: "",
        publicId: "",
        altText: "",
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        focusKeyword: "",
        canonicalUrl: "",
        metaRobotsIndex: true,
      },
    },
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedImage = watch("image");
  const watchedSeo = watch("seo");

  React.useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        slug: categoryToEdit.slug,
        description: categoryToEdit.description || "",
        parentId: categoryToEdit.parentId?._id || null,
        displayOrder: categoryToEdit.displayOrder || 0,
        isActive: categoryToEdit.isActive,
        image: {
          url: categoryToEdit.image?.url || "",
          publicId: categoryToEdit.image?.publicId || "",
          altText: categoryToEdit.image?.altText || "",
        },
        seo: {
          metaTitle: categoryToEdit.seo?.metaTitle || "",
          metaDescription: categoryToEdit.seo?.metaDescription || "",
          focusKeyword: categoryToEdit.seo?.focusKeyword || "",
          canonicalUrl: categoryToEdit.seo?.canonicalUrl || "",
          metaRobotsIndex: categoryToEdit.seo?.metaRobotsIndex ?? true,
        },
      });
      if (isSeoOnly) {
        setActiveTab("seo");
      }
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        parentId: null,
        displayOrder: 0,
        isActive: true,
        image: { url: "", publicId: "", altText: "" },
        seo: {
          metaTitle: "",
          metaDescription: "",
          focusKeyword: "",
          canonicalUrl: "",
          metaRobotsIndex: true,
        },
      });
      setActiveTab("general");
    }
  }, [categoryToEdit, reset, open, isSeoOnly]);

  // Auto-generate slug from name
  const generateSlug = () => {
    if (!watchedName) return;
    const s = watchedName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", s, { shouldValidate: true });
    if (!watchedSeo?.canonicalUrl) {
      setValue("seo.canonicalUrl", `https://torchdc.com/category/${s}`);
    }
  };

  // Auto-generate SEO defaults
  const autoGenerateSeo = () => {
    if (!watchedName) {
      toast.error("Please enter category name first");
      return;
    }
    const title = `Buy ${watchedName} in Washington DC | TORCH Dispensary`;
    const desc = `Shop premium ${watchedName} in Washington DC at Torch Dispensary. Lab-tested quality, fast local weed delivery & store pickup available.`;
    const kw = `${watchedName} Washington DC`;
    const slug = watchedSlug || watchedName.toLowerCase().replace(/\s+/g, "-");

    setValue("seo.metaTitle", title);
    setValue("seo.metaDescription", desc);
    setValue("seo.focusKeyword", kw);
    setValue("seo.canonicalUrl", `https://torchdc.com/category/${slug}`);
    toast.success("SEO defaults generated!");
  };

  // Cloudinary image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP)");
      return;
    }

    setIsUploadingImage(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/categories/upload-image", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload to Cloudinary");
      }

      setValue("image.url", json.data.url);
      setValue("image.publicId", json.data.publicId);
      if (!watchedImage?.altText && watchedName) {
        setValue("image.altText", `${watchedName} cannabis category`);
      }

      toast.success("Image uploaded to Cloudinary!", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setValue("image.url", "");
    setValue("image.publicId", "");
    toast("Image removed. Will be deleted from Cloudinary on save.", { icon: "🗑️" });
  };

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);

    const promise = (async () => {
      const url = isEditing
        ? `/api/admin/categories/${categoryToEdit?._id}`
        : "/api/admin/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to save category");
      }

      onSuccess();
      onOpenChange(false);
      return resData;
    })();

    toast.promise(promise, {
      loading: isEditing ? "Updating category..." : "Creating category...",
      success: isEditing
        ? `Category "${data.name}" updated successfully`
        : `Category "${data.name}" created successfully`,
      error: (err) => err.message,
    });

    try {
      await promise;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Search Preview Values
  const previewTitle =
    watchedSeo?.metaTitle ||
    (watchedName
      ? `Buy ${watchedName} in Washington DC | TORCH Dispensary`
      : "TORCH Cannabis Dispensary | Washington DC");

  const previewDesc =
    watchedSeo?.metaDescription ||
    (watchedName
      ? `Shop premium ${watchedName} in Washington DC at Torch Dispensary. Fast local cannabis delivery and dispensary pickup.`
      : "Premium Washington DC weed dispensary offering local delivery and pickup.");

  const previewSlug = watchedSlug || (watchedName ? watchedName.toLowerCase().replace(/\s+/g, "-") : "category");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? `Edit Category: ${categoryToEdit?.name}` : "Create New Category"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure category hierarchy, Cloudinary media, and SEO indexing.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex border-b border-border gap-2 pt-2">
          {!isSeoOnly && (
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "general"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>General Details</span>
            </button>
          )}

          {!isSeoOnly && (
            <button
              type="button"
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "image"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Image & Cloudinary</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "seo"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO & Indexing</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* TAB 1: General Details */}
          {activeTab === "general" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flowers, Edibles, Sativa"
                    {...register("name")}
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.name ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      Generate from name
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. flowers, sativa"
                    {...register("slug")}
                    className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.slug ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              {/* Parent Category Hierarchy */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Parent Category (Hierarchy)
                </label>
                <select
                  {...register("parentId")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">None (Top-Level Category)</option>
                  {allCategories
                    .filter((c) => !categoryToEdit || c._id !== categoryToEdit._id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.parentId ? `↳ ${cat.name}` : cat.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Select a parent to create a subcategory (e.g. select <strong>Flowers</strong> for <strong>Sativa</strong>).
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe this category for customers and search engines..."
                  {...register("description")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Display Order & Active State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Display Order
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register("displayOrder", { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-xs font-medium text-foreground cursor-pointer"
                  >
                    Category Active in Storefront
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Image & Cloudinary */}
          {activeTab === "image" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-dashed border-border bg-card/60 space-y-3 text-center">
                {watchedImage?.url ? (
                  <div className="space-y-3">
                    <div className="relative w-36 h-36 mx-auto rounded-lg overflow-hidden border border-border shadow-xs">
                      <Image
                        src={watchedImage.url}
                        alt={watchedImage.altText || "Category image"}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    </div>
                    {watchedImage.publicId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border inline-block">
                        Cloudinary ID: {watchedImage.publicId}
                      </span>
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Upload to Cloudinary
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Image will be hosted on Cloudinary and automatically deleted when replaced or removed.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary-hover transition-colors shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingImage ? "Uploading..." : "Choose Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Direct Image URL input (optional fallback) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Image URL (Direct or Cloudinary)
                  </label>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    {...register("image.url")}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Image Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Sativa cannabis flower in DC"
                    {...register("image.altText")}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO & Indexing Controls */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    Search Engine Optimization (SEO)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Optimize meta tags for Google indexing in Washington DC.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={autoGenerateSeo}
                  className="text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
                  Auto-fill SEO
                </Button>
              </div>

              {/* Google SERP Live Snippet Preview */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  <Search className="w-3.5 h-3.5" />
                  <span>Google Search Preview</span>
                </div>
                <div className="text-[12px] text-emerald-700 dark:text-emerald-400 truncate font-mono">
                  https://torchdc.com › category › {previewSlug}
                </div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight">
                  {previewTitle}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {previewDesc}
                </div>
              </div>

              {/* Meta Title Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Meta Title
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      (watchedSeo?.metaTitle?.length || 0) > 60
                        ? "text-amber-500 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {watchedSeo?.metaTitle?.length || 0}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Buy [Category] in Washington DC | TORCH Dispensary"
                  {...register("seo.metaTitle")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Meta Description Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      (watchedSeo?.metaDescription?.length || 0) > 160
                        ? "text-amber-500 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {watchedSeo?.metaDescription?.length || 0}/160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Shop premium [Category] in Washington DC at Torch Dispensary. Fast delivery & store pickup..."
                  {...register("seo.metaDescription")}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Focus Keyword & Canonical URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sativa weed dc"
                    {...register("seo.focusKeyword")}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://torchdc.com/category/..."
                    {...register("seo.canonicalUrl")}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Search Indexing Robots Meta Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    {watchedSeo?.metaRobotsIndex ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>Google Indexing Status</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {watchedSeo?.metaRobotsIndex
                      ? "Index & Follow (Appears in Google search results)"
                      : "Noindex, Nofollow (Hidden from search engines)"}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("seo.metaRobotsIndex")}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              {isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
