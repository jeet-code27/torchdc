import type { Metadata } from "next";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Shop All Cannabis Products | Torch Dispensary Washington DC",
  description:
    "Explore Torch's curated dispensary menu: Midshelf, Topshelf, and Exotic flower, pre-rolls, disposables, concentrates, edibles, and mushrooms. Fast DC delivery.",
};

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
