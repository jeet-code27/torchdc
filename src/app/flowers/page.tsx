import type { Metadata } from "next";
import { getShopProducts } from "@/lib/get-shop-products";
import { FlowersView } from "@/components/storefront/flowers-view";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("flowers");
}

export const revalidate = 60;

export default async function FlowersPage({
  searchParams,
}: {
  searchParams?: Promise<{ tier?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const products = await getShopProducts();

  return (
    <FlowersView
      initialProducts={products}
      initialTier={resolvedParams.tier}
    />
  );
}
