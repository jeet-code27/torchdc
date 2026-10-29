import type { Metadata } from "next";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("shop");
}

export const revalidate = 60;

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const products = await getShopProducts();

  return (
    <ShopCatalog
      key={`${resolvedParams.category || ""}|${resolvedParams.q || ""}`}
      initialProducts={products}
      initialCategory={resolvedParams.category}
      initialQuery={resolvedParams.q}
    />
  );
}
