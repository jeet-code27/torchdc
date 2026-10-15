import type { Metadata } from "next";
import { getShopProducts } from "@/lib/get-shop-products";
import { FlowersView } from "@/components/storefront/flowers-view";

export const metadata: Metadata = {
  title: "Cannabis Flower Delivery in DC | Midshelf, Topshelf, Private Reserve | Torch",
  description:
    "Hand-picked cannabis flower in three tiers: Midshelf, Topshelf and Private Reserve. Free same-day delivery across Washington, DC.",
};

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
