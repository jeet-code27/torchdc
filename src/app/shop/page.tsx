import type { Metadata } from "next";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Shop Cannabis Online in DC | Torch Cannabis Delivery",
  description:
    "Shop flower, pre-rolls, disposables, concentrates and edibles for free delivery across Washington, DC. Pay cash on delivery.",
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
