"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  UploadCloud,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  categoryId?: string;
  initialMode: "edit" | "create";
}

interface CategoryData {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | { _id: string; name: string } | null;
  image?: {
    url?: string;
    publicId?: string;
    altText?: string;
  };
  displayOrder: number;
  isActive: boolean;
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({ categoryId, initialMode }: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(initialMode === "edit");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Available parent categories
  const [allCategories, setAllCategories] = React.useState<
    Array<{ _id: string; name: string; slug: string }>
  >([]);

  // Form states
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);
  const [parentId, setParentId] = React.useState<string>("");
  const [description, setDescription] = React.useState("");
  const [displayOrder, setDisplayOrder] = React.useState<number>(0);
  const [isActive, setIsActive] = React.useState(true);

  // Image state
  const [imageUrl, setImageUrl] = React.useState("");
  const [imagePublicId, setImagePublicId] = React.useState("");
  const [imageAltText, setImageAltText] = React.useState("");

  // SEO states
  const [focusKeyword, setFocusKeyword] = React.useState("");
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [canonicalUrl, setCanonicalUrl] = React.useState("");
  const [metaRobotsIndex, setMetaRobotsIndex] = React.useState(true);

  // Timestamps
  const [createdAt, setCreatedAt] = React.useState<string>("");
  const [updatedAt, setUpdatedAt] = React.useState<string>("");

  // Fetch all categories for parent selector
  const fetchAllCategories = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAllCategories(json.data);
      }
    } catch {
      console.error("Could not load categories list");
    }
  }, []);

  // Fetch category data if in edit mode
  React.useEffect(() => {
    fetchAllCategories();

    if (initialMode === "edit" && categoryId) {
      setIsLoading(true);
      fetch(`/api/admin/categories/${categoryId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const cat: CategoryData = json.data;
            setName(cat.name || "");
            setSlug(cat.slug || "");
            setIsSlugManuallyEdited(true);
            setDescription(cat.description || "");
            setDisplayOrder(cat.displayOrder ?? 0);
            setIsActive(cat.isActive ?? true);

            const pId = typeof cat.parentId === "object" ? cat.parentId?._id : cat.parentId;
            setParentId(pId || "");

            if (cat.image) {
              setImageUrl(cat.image.url || "");
              setImagePublicId(cat.image.publicId || "");
              setImageAltText(cat.image.altText || "");
            }

            if (cat.seo) {
              setFocusKeyword(cat.seo.focusKeyword || "");
              setMetaTitle(cat.seo.metaTitle || "");
              setMetaDescription(cat.seo.metaDescription || "");
              setCanonicalUrl(cat.seo.canonicalUrl || "");
              setMetaRobotsIndex(cat.seo.metaRobotsIndex ?? true);
            }

            if (cat.createdAt) setCreatedAt(cat.createdAt);
            if (cat.updatedAt) setUpdatedAt(cat.updatedAt);
          } else {
            toast.error(json.error || "Category not found");
            router.push("/admin/categories");
          }
        })
        .catch(() => {
          toast.error("Failed to load category details");
          router.push("/admin/categories");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialMode, categoryId, fetchAllCategories, router]);

  // Handle Name change and auto-slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited || initialMode === "create") {
      const generated = slugify(val);
      setSlug(generated);
      if (!metaTitle || initialMode === "create") {
        setMetaTitle(`Buy ${val} in Washington DC | TORCH Dispensary`);
      }
      if (!focusKeyword || initialMode === "create") {
        setFocusKeyword(`${val} Washington DC`);
      }
      if (!canonicalUrl || initialMode === "create") {
        setCanonicalUrl(`https://torchdc.com/category/${generated}`);
      }
    }
  };

  // Image upload to Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const toastId = toast.loading("Uploading image to Cloudinary...");
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/categories/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setImageUrl(json.data.url);
          setImagePublicId(json.data.publicId);
          if (!imageAltText) {
            setImageAltText(`${name || "Category"} image | TORCH DC`);
          }
          toast.success("Image uploaded to Cloudinary", { id: toastId });
        } else {
          toast.error(json.error || "Upload failed", { id: toastId });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Error reading image file", { id: toastId });
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImagePublicId("");
    setImageAltText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Image removed. It will be permanently removed upon saving.");
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Category slug is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(
      initialMode === "edit" ? "Saving category..." : "Creating category..."
    );

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      parentId: parentId || null,
      displayOrder: Number(displayOrder) || 0,
      isActive,
      image: {
        url: imageUrl || "",
        publicId: imagePublicId || "",
        altText: imageAltText || `${name} | TORCH DC`,
      },
      seo: {
        metaTitle: metaTitle.trim() || `Buy ${name} in Washington DC | TORCH Dispensary`,
        metaDescription:
          metaDescription.trim() ||
          `Shop premium ${name} in Washington DC at Torch Dispensary. Fast local weed delivery.`,
        focusKeyword: focusKeyword.trim() || `${name} Washington DC`,
        canonicalUrl: canonicalUrl.trim() || `https://torchdc.com/category/${slug}`,
        metaRobotsIndex,
      },
    };

    try {
      const url =
        initialMode === "edit"
          ? `/api/admin/categories/${categoryId}`
          : "/api/admin/categories";
      const method = initialMode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(
          initialMode === "edit"
            ? `Category "${name}" updated!`
            : `Category "${name}" created!`,
          { id: toastId }
        );
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(json.error || "Failed to save category", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading category details...</p>
      </div>
    );
  }

  // Live SERP Preview Values
  const previewTitle =
    metaTitle.trim() ||
    (name ? `Buy ${name} in Washington DC | TORCH Dispensary` : "TORCH Dispensary");
  const previewDesc =
    metaDescription.trim() ||
    `Shop premium ${name || "cannabis"} in Washington DC at Torch Dispensary. Fast local weed delivery and dispensary pickup.`;
  const previewSlug = slug.trim() || slugify(name) || "category-name";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Categories"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {initialMode === "edit" ? `Edit: ${name || "Category"}` : "Create Category"}
              </h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isActive ? "Active" : "Draft / Inactive"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {initialMode === "edit"
                ? "Update category taxonomy, Cloudinary media, and Google SERP metadata"
                : "Add a new product category with automated SEO indexing and Cloudinary image"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{initialMode === "edit" ? "Save Changes" : "Create Category"}</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: General Info & SEO (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: General Category Info */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <FolderTree className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">General Information</h2>
            </div>

            <div className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Flowers, Edibles, Disposables"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    URL Slug <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(slugify(name));
                      setIsSlugManuallyEdited(false);
                      toast.success("Slug regenerated from name");
                    }}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-border bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                  <span className="px-3 py-2.5 text-xs text-muted-foreground bg-muted/60 border-r border-border select-none">
                    torchdc.com/category/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugManuallyEdited(true);
                    }}
                    placeholder="flowers"
                    className="flex-1 px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Parent Category Hierarchy */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Parent Category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                >
                  <option value="">None (Top-Level Category)</option>
                  {allCategories
                    .filter((c) => c._id !== categoryId) // Don't let category be its own parent
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} (/{c.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Optional. Select a parent category to create a sub-category hierarchy (e.g. Flowers &gt; Sativa).
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Category Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this category for buyers and search engines..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-y"
                />
              </div>
            </div>
          </div>

          {/* Card 2: SEO Engine & Google SERP Preview */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-semibold text-foreground">
                  Search Engine Optimization (SEO)
                </h2>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                Google Index Ready
              </span>
            </div>

            {/* Live Google Search Result Box */}
            <div className="bg-background border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Live Google SERP Snippet Preview
                </span>
                <span className="text-[10px] text-muted-foreground">Google Desktop / Mobile</span>
              </div>

              {/* Google Result Look */}
              <div className="p-3.5 bg-card rounded-lg border border-border/60 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[11px] font-bold">
                    T
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-foreground font-medium leading-none">
                      Torch Dispensary
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate max-w-md mt-0.5">
                      https://torchdc.com › category › {previewSlug}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pt-0.5 line-clamp-1">
                  {previewTitle}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {previewDesc}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* Focus Keyword */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. Flowers Washington DC, Weed Delivery DC"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Target keyword for DC local search rankings.
                </p>
              </div>

              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    SEO Meta Title
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      metaTitle.length > 60
                        ? "text-amber-500 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metaTitle.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={`Buy ${name || "Products"} in Washington DC | TORCH Dispensary`}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                {/* Character visual indicator */}
                <div className="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      metaTitle.length <= 60
                        ? "bg-emerald-500"
                        : metaTitle.length <= 70
                        ? "bg-amber-500"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${Math.min(100, (metaTitle.length / 60) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    SEO Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      metaDescription.length > 160
                        ? "text-amber-500 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metaDescription.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={`Shop premium ${name || "cannabis"} in Washington DC at Torch Dispensary. Fast local delivery across DC.`}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-y"
                />
                <div className="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      metaDescription.length <= 160
                        ? "bg-emerald-500"
                        : metaDescription.length <= 170
                        ? "bg-amber-500"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={`https://torchdc.com/category/${slug}`}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Prevents duplicate content penalties if products exist under multiple categories.
                </p>
              </div>

              {/* Robots Index Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-muted/20">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Allow Google & Search Engines to Index
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sets meta robots to &quot;{metaRobotsIndex ? "index, follow" : "noindex, nofollow"}&quot;.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMetaRobotsIndex(!metaRobotsIndex)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    metaRobotsIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      metaRobotsIndex ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Image, Visibility & Metadata (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 3: Featured Category Image (Cloudinary) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Category Image</h2>
              </div>
              {imageUrl && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Cloudinary
                </span>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="space-y-3">
                <div className="relative group rounded-xl overflow-hidden border border-border bg-muted/40 aspect-square flex items-center justify-center">
                  <Image
                    src={imageUrl}
                    alt={imageAltText || name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Alt Text for Google Images */}
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                    Image Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    value={imageAltText}
                    onChange={(e) => setImageAltText(e.target.value)}
                    placeholder="Keywords describing this category image"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Public ID:</span>
                  <span className="font-mono truncate max-w-[170px]" title={imagePublicId}>
                    {imagePublicId || "Uploaded"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition aspect-square"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-xs font-semibold text-foreground">
                      Click to upload category image
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Direct upload to Cloudinary (PNG, JPG, WEBP up to 5MB)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Visibility & Ordering */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground pb-3 border-b border-border">
              Display & Visibility
            </h2>

            {/* Active Switch */}
            <div className="flex items-center justify-between py-1">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Category Status
                </label>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? "Visible in storefront & menus" : "Hidden from public catalog"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isActive ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Display Order */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Lower numbers appear first in navigation and category lists.
              </p>
            </div>
          </div>

          {/* Card 5: Meta Info (Edit Mode Only) */}
          {initialMode === "edit" && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-foreground pb-2 border-b border-border">
                Record Details
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Category ID:</span>
                  <span className="font-mono text-foreground truncate max-w-[160px]" title={categoryId}>
                    {categoryId}
                  </span>
                </div>
                {createdAt && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Created:</span>
                    <span className="text-foreground">
                      {new Date(createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {updatedAt && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Updated:</span>
                    <span className="text-foreground">
                      {new Date(updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
