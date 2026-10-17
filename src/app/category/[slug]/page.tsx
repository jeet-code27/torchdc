import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const CATEGORY_NAMES: Record<string, string> = {
  flowers: "Flowers",
  "pre-rolls": "Pre-Rolls",
  disposables: "Disposables",
  concentrates: "Concentrates",
  edibles: "Edibles",
  mushrooms: "Mushrooms",
  cartridges: "Cartridges",
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();
  if (normalizedSlug === "flowers" || normalizedSlug === "flower") {
    return {
      title: "Cannabis Flower Delivery in DC | Midshelf, Topshelf, Exotic | Torch",
      description: "Hand-picked cannabis flower in three tiers: Midshelf, Topshelf and Exotic. Free same-day delivery across Washington, DC.",
    };
  }
  const displayName =
    CATEGORY_NAMES[normalizedSlug] ||
    normalizedSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${displayName} | Order Online with Fast DC Delivery | Torch Dispensary`,
    description: `Shop premium ${displayName} at Torch Dispensary in Washington DC. Fast DC delivery. 21+ only.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();

  if (normalizedSlug === "flowers" || normalizedSlug === "flower") {
    redirect("/flowers");
  }

  const products = await getShopProducts();

  return (
    <ShopCatalog initialProducts={products} initialCategory={normalizedSlug} />
  );
}
