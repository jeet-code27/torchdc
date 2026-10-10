"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Flame,
  ChevronRight,
  Info,
  Truck,
  Store,
  Search,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProductCard, ShopProduct } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";
import { StoreFaqSection } from "./store-faq-section";
import { MobileCategoryGrid } from "./mobile-category-grid";
import { ProductSlider } from "./product-slider";

interface HomeStorefrontViewProps {
  products: ShopProduct[];
}

export function HomeStorefrontView({ products }: HomeStorefrontViewProps) {
  const router = useRouter();
  const { fulfillment, setFulfillment, isPickupEnabled } = useCart();
  const [showFullLegalText, setShowFullLegalText] = React.useState(false);

  // Group products by category (6 products per section for 2 balanced rows of 3)
  const bestSellers = React.useMemo(() => {
    const list = products.filter((p) => p.isBestSeller);
    return list.length >= 6 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    const list = products.filter((p) => p.isNewArrival);
    return list.length >= 6 ? list.slice(0, 6) : products.slice(4, 10);
  }, [products]);

  const flowers = React.useMemo(() => {
    const list = products.filter((p) => p.category === "flowers");
    return list.length > 0 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  const preRolls = React.useMemo(() => {
    const list = products.filter((p) => p.category === "pre-rolls");
    return list.length > 0 ? list.slice(0, 6) : products.slice(2, 8);
  }, [products]);

  const disposables = React.useMemo(() => {
    const list = products.filter(
      (p) => p.category === "disposables" || p.category === "cartridges"
    );
    return list.length > 0 ? list.slice(0, 6) : products.slice(1, 7);
  }, [products]);

  const edibles = React.useMemo(() => {
    const list = products.filter((p) => p.category === "edibles");
    return list.length > 0 ? list.slice(0, 6) : products.slice(3, 9);
  }, [products]);

  const mushrooms = React.useMemo(() => {
    const list = products.filter((p) => p.category === "mushrooms");
    return list.length > 0 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
      <div className="flex gap-4 lg:gap-5 xl:gap-6 items-start">
        {/* ================= 1. DESKTOP LEFT RAIL (Category Navigation) ================= */}
        <div className="hidden lg:block shrink-0 sticky top-24 self-start">
          <ShopSidebar scrollLinks={true} />
        </div>

        {/* ================= 2. MAIN CENTER CONTENT (Slider + Categorized Sections) ================= */}
        <main className="flex-1 min-w-0 space-y-4 sm:space-y-6">
          {/* ================= MOBILE SEARCH BAR (Above Banner) ================= */}
          <div className="lg:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("search") as HTMLInputElement;
                if (input?.value.trim()) {
                  router.push(`/shop?search=${encodeURIComponent(input.value.trim())}`);
                }
              }}
              className="relative w-full"
            >
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="search"
                placeholder="What are you looking for today?"
                className="w-full bg-[#f4f5f4] hover:bg-[#edf0ed] focus:bg-white text-sm text-neutral-800 placeholder-neutral-500 rounded-full pl-11 pr-4 py-2.5 sm:py-3 outline-none border border-transparent focus:border-[#5A805B] transition-all shadow-2xs"
              />
            </form>
          </div>

          {/* ================= HERO SLIDER CAROUSEL ================= */}
          <StoreHeroCarousel />

          {/* ================= MOBILE ORDER MODE SWITCHER (Below Banner, No Extra Text) ================= */}
          <div className="lg:hidden bg-neutral-100 p-1 rounded-full flex text-xs font-bold max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`flex-1 py-2 sm:py-2.5 text-center rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                fulfillment === "delivery"
                  ? "bg-[#5A805B] text-white font-black shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`flex-1 py-2 sm:py-2.5 text-center rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                fulfillment === "pickup"
                  ? "bg-[#5A805B] text-white font-black shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Pickup</span>
            </button>
          </div>

          {/* ================= MOBILE SHOP BY CATEGORY (Below Toggle, Mobile Only) ================= */}
          <MobileCategoryGrid />

          {/* ================= 1. BEST SELLERS ================= */}
          <ProductSlider
            id="section-best-sellers"
            title="Best Sellers"
            seeAllHref="/shop?category=best-sellers"
            products={bestSellers}
            defaultBadge="Best Seller"
          />

          {/* ================= 2. NEW ARRIVALS ================= */}
          <ProductSlider
            id="section-new-arrivals"
            title="New Arrivals"
            seeAllHref="/shop?category=new-arrivals"
            products={newArrivals}
            defaultBadge="New"
          />

          {/* ================= 3. FLOWERS ================= */}
          <ProductSlider
            id="section-flowers"
            title="Flowers"
            seeAllHref="/shop?category=flowers"
            products={flowers}
          />

          {/* ================= 4. PRE-ROLLS ================= */}
          <ProductSlider
            id="section-pre-rolls"
            title="Pre-rolls"
            seeAllHref="/shop?category=pre-rolls"
            products={preRolls}
          />

          {/* ================= 5. DISPOSABLES & CARTRIDGES ================= */}
          <ProductSlider
            id="section-disposables"
            title="Disposable Vape & Cartridges"
            seeAllHref="/shop?category=disposables"
            products={disposables}
          />

          {/* ================= 6. EDIBLES ================= */}
          <ProductSlider
            id="section-edibles"
            title="Edibles"
            seeAllHref="/shop?category=edibles"
            products={edibles}
          />

          {/* ================= 7. MUSHROOMS ================= */}
          <ProductSlider
            id="section-mushrooms"
            title="Mushrooms"
            seeAllHref="/shop?category=mushrooms"
            products={mushrooms}
          />

          {/* ================= LEGAL COMPLIANCE BOX ================= */}
          <div className="rounded-3xl bg-neutral-100/70 border border-neutral-200/80 p-6 sm:p-8 space-y-4 text-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                Our Organization and Initiative 71 Delivery
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-3">
              <p>
                Torch operates in strict compliance with the laws of the District of Columbia under <strong>Initiative 71</strong>. We are a premier Washington D.C. gifting service committed to providing safe, discreet, and reliable delivery of premium cannabis products directly to eligible adults aged 21 and older.
              </p>
              {showFullLegalText && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <p>
                    All items are gifted pursuant to D.C. Official Code § 48-904.01. Valid government-issued photo identification (Driver&apos;s License, Passport, or State ID) is required upon delivery or pickup. We do not deliver to federal lands, including the National Mall, military bases, or federal buildings.
                  </p>
                  <p>
                    Payment is handled securely via Cash On Delivery (COD) upon inspection of your order. Our dedicated dispatchers ensure average delivery times of 35 to 45 minutes across Dupont Circle, Georgetown, Capitol Hill, Adams Morgan, Navy Yard, and greater Washington D.C.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFullLegalText(!showFullLegalText)}
              className="text-xs font-bold text-[#5A805B] hover:underline pt-1 inline-block cursor-pointer"
            >
              {showFullLegalText ? "Show Less" : "Read More"}
            </button>
          </div>

          {/* ================= FAQ ACCORDION ================= */}
          <StoreFaqSection />
        </main>

        {/* ================= 3. DESKTOP RIGHT RAIL (Sticky Cart Sidebar) ================= */}
        <div className="hidden xl:block shrink-0 sticky top-24 self-start">
          <ShopCartSidebar />
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING CART PILL ================= */}
      <ShopStickyCartBar />
    </div>
  );
}
