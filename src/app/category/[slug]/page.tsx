import type { Metadata } from "next";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreFooter } from "@/components/storefront/store-footer";
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
  const displayName =
    CATEGORY_NAMES[normalizedSlug] ||
    normalizedSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    title: `${displayName} | Order Online with Fast DC Delivery | Torch Dispensary`,
    description: `Shop premium ${displayName} at Torch Dispensary in Washington DC. Fast 35-45 min delivery and 15-min curbside pickup. Initiative 71 compliant.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug).toLowerCase();
  const products = await getShopProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      {/* 1. Top Announcement Status Bar */}
      <StoreStatusBar />

      {/* 2. Shop Catalog with category pre-filtered */}
      <div className="flex-1">
        <ShopCatalog initialProducts={products} initialCategory={normalizedSlug} />
      </div>

      {/* 3. Footer */}
      <StoreFooter />
    </div>
  );
}
