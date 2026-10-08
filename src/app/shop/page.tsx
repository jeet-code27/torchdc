import type { Metadata } from "next";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ShopCatalog } from "@/components/storefront/shop-catalog";

export const metadata: Metadata = {
  title: "Shop All Cannabis Products | Torch Dispensary Washington DC",
  description:
    "Explore Torch DC's curated dispensary menu: Midshelf, Topshelf, and Private Reserve flower, pre-rolls, disposables, concentrates, edibles, and mushrooms. Fast DC delivery.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#557754]/20 selection:text-[#557754]">
      {/* 1. Top Announcement Status Bar */}
      <StoreStatusBar />

      {/* 2. Shop Catalog (With single dedicated search header matching mockup) */}
      <div className="flex-1">
        <ShopCatalog />
      </div>

      {/* 3. Footer */}
      <StoreFooter />
    </div>
  );
}
