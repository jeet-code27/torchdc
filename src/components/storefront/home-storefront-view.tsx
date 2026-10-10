"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  ChevronRight,
  Info,
} from "lucide-react";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProductCard, ShopProduct } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";
import { StoreFaqSection } from "./store-faq-section";

interface HomeStorefrontViewProps {
  products: ShopProduct[];
}

export function HomeStorefrontView({ products }: HomeStorefrontViewProps) {
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
        <main className="flex-1 min-w-0 space-y-10">
          {/* ================= HERO SLIDER CAROUSEL ================= */}
          <StoreHeroCarousel />

          {/* ================= 1. BEST SELLERS ================= */}
          <section id="section-best-sellers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E8561E]" />
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                  Best Sellers
                </h2>
              </div>
              <Link
                href="/shop?category=best-sellers"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {bestSellers.map((prod) => (
                <ShopProductCard
                  key={prod.id}
                  product={{ ...prod, badge: "Best Seller" }}
                />
              ))}
            </div>
          </section>

          {/* ================= 2. NEW ARRIVALS ================= */}
          <section id="section-new-arrivals" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/shop?category=new-arrivals"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {newArrivals.map((prod) => (
                <ShopProductCard
                  key={prod.id}
                  product={{ ...prod, badge: "New" }}
                />
              ))}
            </div>
          </section>

          {/* ================= 3. FLOWERS ================= */}
          <section id="section-flowers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Flowers
              </h2>
              <Link
                href="/shop?category=flowers"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {flowers.map((prod) => (
                <ShopProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>

          {/* ================= 4. PRE-ROLLS ================= */}
          <section id="section-pre-rolls" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Pre-rolls
              </h2>
              <Link
                href="/shop?category=pre-rolls"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {preRolls.map((prod) => (
                <ShopProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>

          {/* ================= 5. DISPOSABLES & CARTRIDGES ================= */}
          <section id="section-disposables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Disposable Vape & Cartridges
              </h2>
              <Link
                href="/shop?category=disposables"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {disposables.map((prod) => (
                <ShopProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>

          {/* ================= 6. EDIBLES ================= */}
          <section id="section-edibles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Edibles
              </h2>
              <Link
                href="/shop?category=edibles"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {edibles.map((prod) => (
                <ShopProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>

          {/* ================= 7. MUSHROOMS ================= */}
          <section id="section-mushrooms" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                Mushrooms
              </h2>
              <Link
                href="/shop?category=mushrooms"
                className="text-xs font-bold text-[#5A805B] hover:underline flex items-center gap-1"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {mushrooms.map((prod) => (
                <ShopProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>

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
