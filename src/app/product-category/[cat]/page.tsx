import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

export const revalidate = 60;

/** One page per category, titles and descriptions from CAT_SEO in the client build.py (Oct 22). */
const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  "pre-rolls": {
    title: "Pre-Roll Delivery in DC | Torch Cannabis Delivery",
    description:
      "Top Shelf and Exotic 1G pre-rolls delivered free across Washington, DC. Order online, pay cash on delivery. 21+ only.",
  },
  disposables: {
    title: "Disposable Vape Delivery in DC | Torch Cannabis Delivery",
    description:
      "Disposable vapes in 1G and 2G, delivered free across Washington, DC. Order online, pay cash on delivery. 21+ only.",
  },
  concentrates: {
    title: "Cannabis Concentrates Delivery in DC | Torch Cannabis Delivery",
    description:
      "Cannabis concentrates delivered free across Washington, DC. Order online, pay cash on delivery. 21+ only.",
  },
  edibles: {
    title: "Cannabis Edibles Delivery in DC | Torch Cannabis Delivery",
    description:
      "Gummies and other cannabis edibles delivered free across Washington, DC. Order online, pay cash on delivery. 21+ only.",
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_SEO).map((cat) => ({ cat }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const seo = CATEGORY_SEO[cat];
  if (!seo) return {};
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: `/product-category/${cat}` },
  };
}

export default async function ProductCategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  if (!CATEGORY_SEO[cat]) notFound();
  const products = await getShopProducts();
  return <ShopCatalog key={cat} initialProducts={products} initialCategory={cat} />;
}
