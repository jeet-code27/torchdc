import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import {
  ProductDetailView,
  ProductDetailData,
} from "@/components/storefront/product-detail-view";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectToDatabase();
    const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

    // 1. Exact match
    let product: any = await Product.findOne({ slug: targetSlug, isActive: true }).lean();

    // 2. Prefix / Fuzzy regex fallback
    if (!product) {
      product = await Product.findOne({
        slug: { $regex: `^${targetSlug.replace(/-/g, "[- ]?")}`, $options: "i" },
        isActive: true,
      }).lean();
    }

    if (!product) {
      return {
        title: "Product Not Found | Torch Dispensary",
      };
    }

    const cleanTitle = product.name
      .replace(/\s*\((sativa|indica|hybrid|sativa hybrid|indica hybrid)\)/i, "")
      .trim();

    return {
      title: `${cleanTitle} | Order Cannabis Delivery & Pickup in Washington DC`,
      description:
        product.shortDescription ||
        `Order ${cleanTitle} online from Torch. Fast 35-45 minute cannabis delivery across Washington D.C. Initiative 71 compliant.`,
      openGraph: {
        title: `${cleanTitle} | Torch Dispensary`,
        description:
          product.shortDescription || `Order ${cleanTitle} online from Torch.`,
        images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return {
      title: "Cannabis Menu | Torch Dispensary",
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  await connectToDatabase();
  const targetSlug = decodeURIComponent(slug).trim().toLowerCase();

  // 1. Fetch main product: Exact slug first, then fallback to prefix / fuzzy slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let productDoc: any = await Product.findOne({
    slug: targetSlug,
    isActive: true,
  }).lean();

  if (!productDoc) {
    productDoc = await Product.findOne({
      slug: { $regex: `^${targetSlug.replace(/-/g, "[- ]?")}`, $options: "i" },
      isActive: true,
    }).lean();
  }

  // 2. Fallback: Word boundary search if still not found
  if (!productDoc) {
    const keywords = targetSlug.split("-").filter((k) => k.length > 2);
    if (keywords.length >= 2) {
      const pattern = keywords.map((k) => `(?=.*${k})`).join("");
      productDoc = await Product.findOne({
        slug: { $regex: pattern, $options: "i" },
        isActive: true,
      }).lean();
    }
  }

  if (!productDoc) {
    notFound();
  }

  // 2. Fetch categories to map IDs to readable categories
  const categories = await Category.find({}).lean();
  const catMap = new Map<string, { name: string; slug: string }>();
  for (const c of categories) {
    catMap.set(c._id.toString(), { name: c.name, slug: c.slug });
  }

  // Map category slugs for this product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productCatSlugs: string[] = (productDoc.categoryIds || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (id: any) => catMap.get(id?.toString())?.slug || ""
  );

  // Determine main category
  let mainCat = { name: "Flowers", slug: "flowers" };
  const mainCategories = [
    "flowers",
    "edibles",
    "disposables",
    "cartridges",
    "pre-rolls",
    "concentrates",
    "mushrooms",
  ];
  for (const mc of mainCategories) {
    if (productCatSlugs.includes(mc)) {
      const found = categories.find((c) => c.slug === mc);
      if (found) {
        mainCat = { name: found.name, slug: found.slug };
      }
      break;
    }
  }

  // Determine strain (sativa, indica, hybrid)
  let strain: "sativa" | "indica" | "hybrid" | undefined;
  const lowerName = productDoc.name.toLowerCase();
  if (productCatSlugs.includes("sativa") || lowerName.includes("sativa")) {
    strain = "sativa";
  } else if (productCatSlugs.includes("indica") || lowerName.includes("indica")) {
    strain = "indica";
  } else if (productCatSlugs.includes("hybrid") || lowerName.includes("hybrid")) {
    strain = "hybrid";
  }

  // Determine tier (midshelf, topshelf, exotic / private reserve)
  let tier: string | undefined;
  if (
    productCatSlugs.includes("private-reserve") ||
    lowerName.includes("private reserve") ||
    lowerName.includes("exotic")
  ) {
    tier = "exotic";
  } else if (
    productCatSlugs.includes("topshelf") ||
    lowerName.includes("topshelf")
  ) {
    tier = "topshelf";
  } else if (
    productCatSlugs.includes("midshelf") ||
    lowerName.includes("midshelf")
  ) {
    tier = "midshelf";
  }

  // 3. Fetch Related Strains (More [Tier] Strains from same category or tier)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relatedFilter: any = {
    _id: { $ne: productDoc._id },
    isActive: true,
  };

  if (productDoc.categoryIds && productDoc.categoryIds.length > 0) {
    relatedFilter.categoryIds = { $in: productDoc.categoryIds };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedDocs: any[] = await Product.find(relatedFilter)
    .sort({ isBestSeller: -1, createdAt: -1 })
    .limit(10)
    .lean();

  if (relatedDocs.length < 6) {
    // Fallback to any active products if category had few
    const additional = await Product.find({
      _id: {
        $nin: [productDoc._id, ...relatedDocs.map((r) => r._id)],
      },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(10 - relatedDocs.length)
      .lean();
    relatedDocs = [...relatedDocs, ...additional];
  }

  const relatedProducts = relatedDocs.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rSlugs = (r.categoryIds || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (id: any) => catMap.get(id?.toString())?.slug || ""
    );
    let rStrain = "Flower";
    if (rSlugs.includes("sativa") || r.name.toLowerCase().includes("sativa")) {
      rStrain = "Sativa";
    } else if (
      rSlugs.includes("indica") ||
      r.name.toLowerCase().includes("indica")
    ) {
      rStrain = "Indica";
    } else if (
      rSlugs.includes("hybrid") ||
      r.name.toLowerCase().includes("hybrid")
    ) {
      rStrain = "Hybrid";
    }

    return {
      id: r._id.toString(),
      name: r.name,
      slug: r.slug,
      price: r.price || (r.variants && r.variants[0]?.price) || 0,
      image:
        r.images?.find((img: { isPrimary?: boolean; url: string }) => img.isPrimary)?.url ||
        r.images?.[0]?.url ||
        "/images/placeholder-product.png",
      strain: rStrain,
      tier: tier || "Midshelf",
    };
  });

  // Use only real variants if product has them
  const rawVariants = Array.isArray(productDoc.variants) ? productDoc.variants : [];
  const variants = rawVariants.map((v: {
    name: string;
    price: number;
    salePrice?: number | null;
    stock?: number;
    inStock?: boolean;
  }) => ({
    name: v.name,
    price: v.price,
    salePrice: v.salePrice || null,
    stock: v.stock,
    inStock: v.inStock !== false,
  }));

  const productData: ProductDetailData = {
    _id: productDoc._id.toString(),
    name: productDoc.name,
    slug: productDoc.slug,
    description: productDoc.description,
    shortDescription: productDoc.shortDescription,
    price: productDoc.price || (variants[0] && variants[0].price) || 0,
    salePrice: productDoc.salePrice || null,
    images:
      productDoc.images && productDoc.images.length > 0
        ? productDoc.images
        : [{ url: "/images/placeholder-product.png", isPrimary: true }],
    variants,
    category: mainCat,
    tier,
    strain,
    brand: productDoc.brand,
    inStock: productDoc.inStock !== false,
    relatedProducts,
  };

  return <ProductDetailView product={productData} />;
}
