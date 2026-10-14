import type { Metadata } from "next";
import { HomeStorefrontView } from "@/components/storefront/home-storefront-view";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Torch | Premium Cannabis Delivery & Pickup in Washington D.C.",
  description:
    "Order premium flowers, pre-rolls, cartridges, edibles, and concentrates in Washington DC. Fast DC delivery. 21+ only.",
};

export const revalidate = 60;

export default async function HomePage() {
  const products = await getShopProducts();

  return <HomeStorefrontView products={products} />;
}
