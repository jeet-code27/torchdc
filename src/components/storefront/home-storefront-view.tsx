"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProduct } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";
import { StoreFaqSection } from "./store-faq-section";
import { MobileCategoryGrid } from "./mobile-category-grid";
import { ProductSlider } from "./product-slider";

const DC_NEIGHBORHOODS = [
  { name: "Downtown", href: "/affordable-cannabis-in-downtown-dc-weed-deals" },
  { name: "Adams Morgan", href: "/adams-morgan-weed-delivery-dc" },
  { name: "Columbia Heights", href: "/affordable-cannabis-columbia-heights-dc" },
  { name: "Brookland", href: "/brookland-dc-weed-delivery-catholic-university-area-torch-cannabis" },
  { name: "Shaw", href: "/shaw-dc-cannabis-delivery-dispensary" },
  { name: "Logan Circle", href: "/cannabis-delivery-in-logan-circle-dc-torch-dispensary" },
  { name: "Capitol Hill", href: "/cannabis-delivery-in-capitol-hill-dc-torch-dispensary" },
  { name: "Navy Yard", href: "/cannabis-delivery-in-navy-yard-dc-torch" },
  { name: "Dupont Circle", href: "/cannabis-delivery-in-dupont-circle-dc-torch-dispensary" },
  { name: "Petworth", href: "/cannabis-delivery-in-petworth-dc-torch" },
  { name: "U Street", href: "/cannabis-delivery-on-u-street-dc-torch" },
  { name: "Georgetown", href: "/cannabis-delivery-in-georgetown-dc-torch-dispensary" },
  { name: "H Street", href: "/cannabis-delivery-on-h-street-ne-dc-torch" },
];

interface HomeStorefrontViewProps {
  products: ShopProduct[];
}

export function HomeStorefrontView({ products }: HomeStorefrontViewProps) {
  const router = useRouter();
  const { fulfillment, setFulfillment } = useCart();
  const [showFullLegalText, setShowFullLegalText] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Group products by category
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

  const concentrates = React.useMemo(() => {
    const list = products.filter((p) => p.category === "concentrates");
    return list.length > 0 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  const edibles = React.useMemo(() => {
    const list = products.filter((p) => p.category === "edibles");
    return list.length > 0 ? list.slice(0, 6) : products.slice(3, 9);
  }, [products]);

  const mushrooms = React.useMemo(() => {
    const list = products.filter((p) => p.category === "mushrooms");
    return list.length > 0 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="shell">
      {/* 1. Left Menu Navigation */}
      <ShopSidebar scrollLinks={true} />

      {/* 2. Main Column */}
      <main className="shell__main">
        {/* Mobile Search Input */}
        <form className="search" role="search" onSubmit={handleMobileSearch}>
          <label htmlFor="mobile-q" className="sr-only">
            Search the menu
          </label>
          <Search className="w-4 h-4 text-neutral-400 ml-4 shrink-0" />
          <input
            id="mobile-q"
            name="q"
            type="search"
            placeholder="What are you looking for today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Hero Banner Carousel */}
        <StoreHeroCarousel />

        {/* Mobile Order Mode Buttons (Delivery vs Pickup) */}
        <div className="orderbtns lg:hidden">
          <button
            type="button"
            className={`pill ${fulfillment === "delivery" ? "pill--green" : "pill--black"}`}
            onClick={() => setFulfillment("delivery")}
          >
            Delivery
          </button>
          <button
            type="button"
            className={`pill ${fulfillment === "pickup" ? "pill--green" : "pill--black"}`}
            onClick={() => setFulfillment("pickup")}
          >
            Pickup
          </button>
        </div>
        <p className="ordernote lg:hidden">
          Free delivery in DC · Pickup at 1000 G St NW
        </p>

        {/* Mobile Categories Grid */}
        <MobileCategoryGrid />

        {/* Delivery in 3 easy steps (Mobile only, with client SVG icons) */}
        <section className="steps lg:hidden" aria-labelledby="steps-h">
          <h2 id="steps-h">Delivery in 3 easy steps</h2>
          <div className="step">
            <div className="step__rail">
              <span className="step__icon" style={{ background: "#85AD85" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                  <path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6" />
                </svg>
              </span>
              <span className="step__line" />
            </div>
            <div className="step__body">
              <strong>Pick your products</strong>
              <span>Order online in a few taps, or call us.</span>
            </div>
          </div>
          <div className="step">
            <div className="step__rail">
              <span className="step__icon" style={{ background: "#5A805B" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="11" r="2.2" />
                  <path d="M5.8 16.2c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14 10h4M14 13.5h3" />
                </svg>
              </span>
              <span className="step__line" />
            </div>
            <div className="step__body">
              <strong>Verify your ID</strong>
              <span>Text us a photo of your ID and a quick selfie.</span>
            </div>
          </div>
          <div className="step">
            <div className="step__rail">
              <span className="step__icon" style={{ background: "#2F4F30" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 6h13v10H1zM14 9h4l4 4v3h-8z" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
              </span>
            </div>
            <div className="step__body">
              <strong>Get your delivery</strong>
              <span>We deliver it right to you.</span>
            </div>
          </div>
        </section>

        {/* Sections synced with menu IDs */}
        <div className="space-y-6 pt-4">
          {/* Desktop-Only Delivery Areas Strip (Directly above Best Sellers) */}
          <section className="hoods hoods--desktop hidden lg:block" aria-labelledby="hoods-desktop-h">
            <div className="sec__head">
              <h2 id="hoods-desktop-h">We deliver to your neighborhood</h2>
            </div>
            <p className="hoods__sub">Free same-day delivery across DC. Tap yours.</p>
            <div className="hoods__rail">
              {DC_NEIGHBORHOODS.map((hood) => (
                <Link key={hood.name} href={hood.href}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  <span>{hood.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <ProductSlider
            id="best"
            title="Best Sellers"
            seeAllHref="/shop?category=best-sellers"
            products={bestSellers}
            defaultBadge="Best Seller"
          />

          <ProductSlider
            id="new"
            title="New Arrivals"
            seeAllHref="/shop?category=new-arrivals"
            products={newArrivals}
            defaultBadge="New"
          />

          <ProductSlider
            id="flowers"
            title="Flowers"
            seeAllHref="/flowers"
            products={flowers}
          />

          <ProductSlider
            id="pre-rolls"
            title="Pre-rolls"
            seeAllHref="/shop?category=pre-rolls"
            products={preRolls}
          />

          <ProductSlider
            id="disposables"
            title="Disposables"
            seeAllHref="/shop?category=disposables"
            products={disposables}
          />

          <ProductSlider
            id="concentrates"
            title="Concentrates"
            seeAllHref="/shop?category=concentrates"
            products={concentrates}
          />

          <ProductSlider
            id="edibles"
            title="Edibles"
            seeAllHref="/shop?category=edibles"
            products={edibles}
          />

          <ProductSlider
            id="mushrooms"
            title="Mushrooms"
            seeAllHref="/shop?category=mushrooms"
            products={mushrooms}
          />
        </div>

        {/* Mobile Delivery Areas Rail */}
        <div className="hoods lg:hidden">
          <div className="sec__head">
            <div>
              <h2>We deliver to your neighborhood</h2>
              <p className="hoods__sub">
                Free same-day delivery across DC. Tap yours.
              </p>
            </div>
          </div>
          <div className="hoods__rail">
            {DC_NEIGHBORHOODS.map((hood) => (
              <Link key={hood.name} href={hood.href}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <span>{hood.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* About & FAQ Info */}
        <div className="dinfo">
          <div className="about">
            <h2>About Torch Cannabis Delivery</h2>
            <p>
              Torch delivers premium cannabis directly to your door across Washington, DC. We stock lab-tested flowers across three curated tiers, whole-flower pre-rolls, disposable vapes, concentrates, and artisan edibles.
            </p>
            {showFullLegalText && (
              <div className="space-y-3">
                <p>
                  No medical card required — all adults 21+ with a valid government photo ID can order online or call (202) 468-1966. Pay with cash at the door. Free delivery across every quadrant in the District.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowFullLegalText(!showFullLegalText)}
              className="linkbtn"
            >
              {showFullLegalText ? "Show less" : "Read more"}
            </button>
          </div>

          <div className="faq">
            <StoreFaqSection />
          </div>
        </div>
      </main>

      {/* 3. Right Cart Column */}
      <ShopCartSidebar />

      {/* 4. Mobile Floating Cart Bar */}
      <ShopStickyCartBar />
    </div>
  );
}
