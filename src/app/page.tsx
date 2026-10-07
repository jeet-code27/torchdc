import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreSearchBar } from "@/components/storefront/store-search-bar";
import { StoreHeroCarousel } from "@/components/storefront/store-hero-carousel";
import { StoreOrderCta } from "@/components/storefront/store-order-cta";
import { StoreCategoryGrid } from "@/components/storefront/store-category-grid";
import { StoreDeliverySteps } from "@/components/storefront/store-delivery-steps";
import { StoreBestSellers } from "@/components/storefront/store-best-sellers";
import { StoreNewArrivals } from "@/components/storefront/store-new-arrivals";
import { StoreFaqSection } from "@/components/storefront/store-faq-section";
import { StoreFooter } from "@/components/storefront/store-footer";

export const metadata = {
  title: "Torch DC | Premium Cannabis Delivery & Pickup in Washington D.C.",
  description:
    "Order premium flowers, pre-rolls, cartridges, edibles, and concentrates in Washington DC. Fast delivery in 35-45 minutes. Initiative 71 compliant.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-gray-900 selection:bg-[#557754]/20 selection:text-[#557754]">
      {/* 1. Top Announcement Status Bar */}
      <StoreStatusBar />

      {/* 2. Main Store Navbar */}
      <StoreNavbar />

      <main className="flex-1 pb-16 space-y-2">
        {/* 3. Search Bar */}
        <StoreSearchBar />

        {/* 4. Hero Promotional Banner Carousel */}
        <StoreHeroCarousel />

        {/* 5. Dual Order Action Buttons (ORDER DELIVERY / ORDER PICKUP) */}
        <StoreOrderCta />

        {/* 6. Shop By Category Grid */}
        <StoreCategoryGrid />

        {/* 7. Delivery in 3 Easy Steps */}
        <StoreDeliverySteps />

        {/* 8. Best Sellers (with Flame & Black Add Button) */}
        <StoreBestSellers />

        {/* 9. New Arrivals */}
        <StoreNewArrivals />

        {/* 10. Washington DC Delivery Info & FAQ Accordion */}
        <StoreFaqSection />
      </main>

      {/* 10. Footer */}
      <StoreFooter />
    </div>
  );
}
