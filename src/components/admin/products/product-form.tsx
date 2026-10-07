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
  Plus,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Star,
  Package,
  DollarSign,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface ProductFormProps {
  productId?: string;
  initialMode: "edit" | "create";
}

interface ProductVariant {
  _id?: string;
  name: string;
  price: number;
  salePrice?: number | null;
  stock?: number;
  inStock: boolean;
  sku?: string;
  attributes?: Record<string, string>;
  wooId?: string | number;
}

interface ProductImage {
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ProductData {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  type: "simple" | "variable";
  price: number;
  salePrice?: number | null;
  stock: number;
  inStock: boolean;
  variants: ProductVariant[];
  categoryIds: Array<{ _id: string; name: string; slug: string } | string>;
  brand?: string;
  images: ProductImage[];
  featured: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isActive: boolean;
  wooId?: string | number;
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
    .replace(/[()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ productId, initialMode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = React.useState(initialMode === "edit");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Available categories
  const [allCategories, setAllCategories] = React.useState<
    Array<{ _id: string; name: string; slug: string; parentId?: unknown }>
  >([]);

  // Form states
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [type, setType] = React.useState<"simple" | "variable">("simple");

  // Pricing & Stock
  const [price, setPrice] = React.useState<number>(0);
  const [salePrice, setSalePrice] = React.useState<number | string>("");
  const [stock, setStock] = React.useState<number>(100);
  const [inStock, setInStock] = React.useState(true);

  // Variants
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);

  // Categories
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

  // Media
  const [images, setImages] = React.useState<ProductImage[]>([]);

  // Status
  const [featured, setFeatured] = React.useState(false);
  const [isBestSeller, setIsBestSeller] = React.useState(false);
  const [isNewArrival, setIsNewArrival] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);
  const [wooId, setWooId] = React.useState<string | number>("");

  // SEO states
  const [focusKeyword, setFocusKeyword] = React.useState("");
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [canonicalUrl, setCanonicalUrl] = React.useState("");
  const [metaRobotsIndex, setMetaRobotsIndex] = React.useState(true);

  // Timestamps
  const [createdAt, setCreatedAt] = React.useState<string>("");
  const [updatedAt, setUpdatedAt] = React.useState<string>("");

  // Load all categories for category selector
  const fetchCategories = React.useCallback(async () => {
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

  // Fetch product data if edit mode
  React.useEffect(() => {
    fetchCategories();

    if (initialMode === "edit" && productId) {
      setIsLoading(true);
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const prod: ProductData = json.data;
            setName(prod.name || "");
            setSlug(prod.slug || "");
            setIsSlugManuallyEdited(true);
            setShortDescription(prod.shortDescription || "");
            setDescription(prod.description || "");
            setSku(prod.sku || "");
            setBrand(prod.brand || "");
            setType(prod.type || "simple");
            setPrice(prod.price || 0);
            setSalePrice(prod.salePrice !== undefined && prod.salePrice !== null ? prod.salePrice : "");
            setStock(prod.stock !== undefined ? prod.stock : 100);
            setInStock(prod.inStock ?? true);
            setVariants(prod.variants || []);
            setFeatured(prod.featured || false);
            setIsBestSeller(prod.isBestSeller || false);
            setIsNewArrival(prod.isNewArrival || false);
            setIsActive(prod.isActive ?? true);
            if (prod.wooId) setWooId(prod.wooId);

            // Category IDs
            const catIds = (prod.categoryIds || []).map((c) =>
              typeof c === "object" ? c._id : c
            );
            setSelectedCategoryIds(catIds);

            // Images
            setImages(prod.images || []);

            // SEO
            if (prod.seo) {
              setFocusKeyword(prod.seo.focusKeyword || "");
              setMetaTitle(prod.seo.metaTitle || "");
              setMetaDescription(prod.seo.metaDescription || "");
              setCanonicalUrl(prod.seo.canonicalUrl || "");
              setMetaRobotsIndex(prod.seo.metaRobotsIndex ?? true);
            }

            if (prod.createdAt) setCreatedAt(prod.createdAt);
            if (prod.updatedAt) setUpdatedAt(prod.updatedAt);
          } else {
            toast.error(json.error || "Product not found");
            router.push("/admin/products");
          }
        })
        .catch(() => {
          toast.error("Failed to load product details");
          router.push("/admin/products");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialMode, productId, fetchCategories, router]);

  // Handle Name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited || initialMode === "create") {
      const generated = slugify(val);
      setSlug(generated);
      if (!metaTitle || initialMode === "create") {
        setMetaTitle(`Buy ${val} in Washington DC | TORCH Dispensary`);
      }
      if (!focusKeyword || initialMode === "create") {
        setFocusKeyword(`${val} DC`);
      }
      if (!canonicalUrl || initialMode === "create") {
        setCanonicalUrl(`https://torchdc.com/product/${generated}`);
      }
    }
  };

  // Image Upload to Cloudinary
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
          body: JSON.stringify({ file: base64, folder: "torch/products" }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          const newImg: ProductImage = {
            url: json.data.url,
            publicId: json.data.publicId,
            altText: `${name || "Product"} | TORCH DC`,
            isPrimary: images.length === 0,
          };
          setImages([...images, newImg]);
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

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
    toast.success("Image removed. It will be permanently cleaned up upon saving.");
  };

  const handleSetPrimaryImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(updated);
  };

  // Variant operations
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      name: "New Variant (e.g. 3.5g)",
      price: price || 50,
      salePrice: null,
      stock: 50,
      inStock: true,
      sku: "",
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof ProductVariant,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Toggle category
  const handleToggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("Product slug is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(
      initialMode === "edit" ? "Saving product..." : "Creating product..."
    );

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      sku: sku.trim(),
      brand: brand.trim(),
      type,
      price: Number(price) || 0,
      salePrice: salePrice !== "" && salePrice !== null ? Number(salePrice) : null,
      stock: Number(stock) || 0,
      inStock,
      variants,
      categoryIds: selectedCategoryIds,
      images,
      featured,
      isBestSeller,
      isNewArrival,
      isActive,
      wooId: wooId || null,
      seo: {
        metaTitle:
          metaTitle.trim() || `Buy ${name} in Washington DC | TORCH Dispensary`,
        metaDescription:
          metaDescription.trim() ||
          `Shop premium ${name} in Washington DC at Torch Dispensary. Fast local weed delivery and pickup.`,
        focusKeyword: focusKeyword.trim() || `${name} DC`,
        canonicalUrl: canonicalUrl.trim() || `https://torchdc.com/product/${slug}`,
        metaRobotsIndex,
      },
    };

    try {
      const url =
        initialMode === "edit"
          ? `/api/admin/products/${productId}`
          : "/api/admin/products";
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
            ? `Product "${name}" updated!`
            : `Product "${name}" created!`,
          { id: toastId }
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(json.error || "Failed to save product", { id: toastId });
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
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  // Live SERP Preview Values
  const previewTitle =
    metaTitle.trim() ||
    (name ? `Buy ${name} in Washington DC | TORCH Dispensary` : "TORCH Dispensary");
  const previewDesc =
    metaDescription.trim() ||
    `Shop ${name || "cannabis"} in Washington DC at Torch Dispensary. Fast local cannabis delivery.`;
  const previewSlug = slug.trim() || slugify(name) || "product-name";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {initialMode === "edit" ? `Edit: ${name || "Product"}` : "Add New Product"}
              </h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isActive ? "Active" : "Draft"}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                {type === "variable" ? "Variable Product" : "Simple Product"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {initialMode === "edit"
                ? "Update catalog product, variants, Cloudinary gallery, and SEO metadata"
                : "Create a new product with Google SERP indexing and variant options"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
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
            <span>{initialMode === "edit" ? "Save Product" : "Publish Product"}</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Primary Column: Info, Pricing, Variants & SEO (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Info */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Product Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Jealousy (Hybrid), Heavy Hitters Sour Diesel Cartridge"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Product Slug (URL) <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSlug(slugify(name));
                    setIsSlugManuallyEdited(false);
                    toast.success("Slug auto-generated from title");
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Auto-generate
                </button>
              </div>
              <div className="flex items-center rounded-lg border border-border bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden">
                <span className="px-3 py-2.5 text-xs text-muted-foreground bg-muted/60 border-r border-border select-none">
                  torchdc.com/product/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="jealousy-hybrid"
                  className="flex-1 px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Brand / Tier
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Private Reserve, Topshelf, Jeeter"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. TORCH-FL-01"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Short Description (Summary)
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief product highlight shown in product cards and quick views..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-y"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Full Description (HTML or Text)
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed strain effects, aroma, THC potency, lineage, lab testing notes..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono text-xs resize-y"
              />
            </div>
          </div>

          {/* Card 2: Pricing, Type & Inventory */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Pricing & Variants</h2>
              </div>

              {/* Product Type Toggle */}
              <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                <button
                  type="button"
                  onClick={() => setType("simple")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    type === "simple"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Simple Product
                </button>
                <button
                  type="button"
                  onClick={() => setType("variable")}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    type === "variable"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Variable (Variants)
                </button>
              </div>
            </div>

            {type === "simple" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Regular Price */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      Regular Price ($) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      placeholder="60.00"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value ? parseFloat(e.target.value) : "")}
                      placeholder="Optional discount price"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 mt-6">
                    <div>
                      <span className="text-xs font-semibold text-foreground">In Stock</span>
                      <p className="text-[10px] text-muted-foreground">Available for immediate purchase</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInStock(!inStock)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        inStock ? "bg-emerald-600" : "bg-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          inStock ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Variable Products Table */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Product Variations ({variants.length})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure weight, sizes, prices, and stock per variant (e.g. 1 oz, 14g, 7g, 3.5g).
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVariant}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variant</span>
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <div className="border border-dashed border-border rounded-xl p-6 text-center text-xs text-muted-foreground">
                    No variations added yet. Click &quot;Add Variant&quot; to configure weights/sizes.
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-3">Variant / Size</th>
                          <th className="p-3 w-28">Reg Price ($)</th>
                          <th className="p-3 w-28">Sale Price ($)</th>
                          <th className="p-3 w-24">Stock</th>
                          <th className="p-3 w-20 text-center">In Stock</th>
                          <th className="p-3 w-12 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) =>
                                  handleUpdateVariant(idx, "name", e.target.value)
                                }
                                placeholder="e.g. 3.5g"
                                className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground text-xs"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                value={v.price}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    idx,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground text-xs font-mono"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                value={v.salePrice ?? ""}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    idx,
                                    "salePrice",
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                                placeholder="-"
                                className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground text-xs font-mono"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                value={v.stock ?? 50}
                                onChange={(e) =>
                                  handleUpdateVariant(
                                    idx,
                                    "stock",
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground text-xs"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={v.inStock}
                                onChange={(e) =>
                                  handleUpdateVariant(idx, "inStock", e.target.checked)
                                }
                                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded transition"
                                title="Remove variant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: SEO Engine & Google SERP Preview */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-semibold text-foreground">
                  Search Engine Optimization (SEO)
                </h2>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                Google Indexing Protected
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
                      https://torchdc.com › product › {previewSlug}
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
                  Focus Keyword (Yoast SEO)
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. Jealousy Hybrid Strain Washington DC"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
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
                  placeholder={`Buy ${name || "Product"} in Washington DC | Torch Dispensary`}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
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
                  placeholder={`Shop ${name || "cannabis"} in Washington DC at Torch Dispensary. Fast local weed delivery across DC.`}
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
                  placeholder={`https://torchdc.com/product/${slug}`}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
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

        {/* Right Sidebar Column: Media Gallery, Categories, Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 4: Product Media Gallery (Cloudinary) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Product Images</h2>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {images.length} Image{images.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-border bg-muted/30 aspect-square flex items-center justify-center"
                >
                  <Image
                    src={img.url}
                    alt={img.altText || name}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="text-[10px] text-white bg-black/60 hover:bg-black px-2 py-1 rounded"
                      >
                        Set as Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-white hover:text-destructive p-1 rounded transition"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition aspect-square p-3"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[11px] font-semibold text-foreground">Upload Image</span>
                    <span className="text-[10px] text-muted-foreground">To Cloudinary</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Categories Assignment */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <FolderTree className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Categories</h2>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {allCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat._id);
                return (
                  <label
                    key={cat._id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition border ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 text-foreground font-semibold"
                        : "hover:bg-muted/40 border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCategory(cat._id)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 6: Visibility & Status */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground pb-3 border-b border-border">
              Product Status
            </h2>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Store Visibility
                </label>
                <p className="text-[11px] text-muted-foreground">
                  {isActive ? "Visible on storefront" : "Hidden in catalog"}
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

            {/* Featured Toggle */}
            <div className="flex items-center justify-between py-1 border-t border-border pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Featured Product
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Highlight on homepage & featured carousels
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  featured ? "bg-amber-500" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    featured ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Best Seller Toggle (🔥) */}
            <div className="flex items-center justify-between py-1 border-t border-border pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <span>Best Seller</span>
                  <span className="text-sm">🔥</span>
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Show in homepage &quot;Best Sellers&quot; section
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBestSeller(!isBestSeller)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isBestSeller ? "bg-[#ea5825]" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isBestSeller ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* New Arrival Toggle (✨) */}
            <div className="flex items-center justify-between py-1 border-t border-border pt-3">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block flex items-center gap-1.5">
                  <span>New Arrival</span>
                  <span className="text-sm">✨</span>
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Show in homepage &quot;New Arrivals&quot; section
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewArrival(!isNewArrival)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isNewArrival ? "bg-emerald-600" : "bg-muted-foreground/30"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isNewArrival ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Card 7: Record Metadata (Edit Mode) */}
          {initialMode === "edit" && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
              <h2 className="text-base font-semibold text-foreground pb-2 border-b border-border">
                Record Details
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Product ID:</span>
                  <span className="font-mono text-foreground truncate max-w-[150px]" title={productId}>
                    {productId}
                  </span>
                </div>
                {wooId && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>WooCommerce ID:</span>
                    <span className="font-mono text-foreground">{wooId}</span>
                  </div>
                )}
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
