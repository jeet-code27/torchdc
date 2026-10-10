import type { Metadata } from "next";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { ShopCatalog } from "@/components/storefront/shop-catalog";
import { getShopProducts } from "@/lib/get-shop-products";

export const metadata: Metadata = {
  title: "Today's Cannabis Deals & Specials | Torch Dispensary Washington DC",
  description:
    "Check out today's exclusive specials at Torch Dispensary: Wake & Bake morning discounts, ounce bundles, and daily dispensary deals with fast DC delivery.",
};

export const revalidate = 60;

export default async function DealsPage() {
  const products = await getShopProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      <StoreStatusBar />
      <StoreNavbar />
      <div className="flex-1">
        <ShopCatalog initialProducts={products} initialCategory="best-sellers" />
      </div>
      <StoreFooter />
    </div>
  );
}
