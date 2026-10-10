import type { Metadata } from "next";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { HomeStorefrontView } from "@/components/storefront/home-storefront-view";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Torch | Premium Cannabis Delivery & Pickup in Washington D.C.",
  description:
    "Order premium flowers, pre-rolls, cartridges, edibles, and concentrates in Washington DC. Fast delivery in 35-45 minutes. Initiative 71 compliant.",
};

export const revalidate = 60;

export default async function HomePage() {
  const products = await getShopProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      {/* 1. Top Announcement Status Bar */}
      <StoreStatusBar />

      {/* 2. Unified Global Store Navbar (Logo, search pill, links, phone, cart drawer, user) */}
      <StoreNavbar />

      {/* 3. Main Storefront View matching client screenshot layout */}
      <div className="flex-1">
        <HomeStorefrontView products={products} />
      </div>

      {/* 4. Deep Brand Green Footer */}
      <StoreFooter />
    </div>
  );
}
