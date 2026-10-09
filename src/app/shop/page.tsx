import type { Metadata } from "next";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Shop All Cannabis Products | Torch Dispensary Washington DC",
  description:
    "Explore Torch's curated dispensary menu: Midshelf, Topshelf, and Private Reserve flower, pre-rolls, disposables, concentrates, edibles, and mushrooms. Fast DC delivery.",
};

export const revalidate = 60;

export default async function ShopPage() {
  const products = await getShopProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      {/* 1. Top Announcement Status Bar */}
      <StoreStatusBar />

      {/* 2. Shop Catalog with live products from MongoDB */}
      <div className="flex-1">
        <ShopCatalog initialProducts={products} />
      </div>

      {/* 3. Footer */}
      <StoreFooter />
    </div>
  );
}
