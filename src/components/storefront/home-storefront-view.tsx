"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProduct, ShopProductCard } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";
import { StoreFaqSection, HOME_FAQS } from "./store-faq-section";
import { MobileCategoryGrid } from "./mobile-category-grid";
import { DeliverySteps } from "./delivery-steps";
import { AREAS_LIST } from "@/lib/areas-data";

// Same list and order as the client site (AREAS in its build.py)
const DC_NEIGHBORHOODS = AREAS_LIST.map((a) => ({ name: a.name, href: `/${a.slug}` }));

interface HomeStorefrontViewProps {
  products: ShopProduct[];
}

const withBadge = (p: ShopProduct, badge: string): ShopProduct =>
  badge && !p.badge ? { ...p, badge } : p;

export function HomeStorefrontView({ products }: HomeStorefrontViewProps) {
  const router = useRouter();
  const { fulfillment, setFulfillment } = useCart();
  const [showFullLegalText, setShowFullLegalText] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Group products by category - Exactly 4 client Best Sellers
  const bestSellers = React.useMemo(() => {
    const TARGET_SLUGS = [
      "strawberry-cough-sativa",
      "clarity-full-spectrum-cannabis-infused-gummies-strawberry-kiwi",
      "2g-plume-ghost-drank-phantom-fuel-x-trop-pop",
      "top-shelf-1g-pre-rolls",
    ];
    const ordered: ShopProduct[] = [];
    for (const slug of TARGET_SLUGS) {
      const found = products.find((p) => p.slug === slug);
      if (found) {
        ordered.push({ ...found, isBestSeller: true });
      }
    }
    if (ordered.length > 0) return ordered;
    return products.filter((p) => p.isBestSeller).slice(0, 4);
  }, [products]);

  // Group products by category - Exactly 4 client New Arrivals
  const newArrivals = React.useMemo(() => {
    const TARGET_SLUGS = [
      "bubba-kush-indica",
      "mixed-fruit-rocket-gummies-500mg-10ct",
      "2g-plume-the-hills-blackwater-x-lushberry",
      "jeeter-bananaconda-enhanced-1g-pre-roll-indica",
    ];
    const ordered: ShopProduct[] = [];
    for (const slug of TARGET_SLUGS) {
      const found = products.find((p) => p.slug === slug);
      if (found) {
        ordered.push({ ...found, isNewArrival: true, badge: "New" });
      }
    }
    if (ordered.length > 0) return ordered;
    return products.filter((p) => p.isNewArrival).slice(0, 4);
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


  // Desktop sections, same order as the client site: Best Sellers, New Arrivals, then each category
  const desktopSections = [
    { id: "best", title: "Best Sellers", list: bestSellers, badge: "Best Seller", href: "/shop?category=best-sellers" },
    { id: "new", title: "New Arrivals", list: newArrivals, badge: "New", href: "/shop?category=new-arrivals" },
    { id: "flowers", title: "Flower", list: flowers, badge: "", href: "/flowers" },
    { id: "pre-rolls", title: "Pre-rolls", list: preRolls, badge: "", href: "/product-category/pre-rolls" },
    { id: "disposables", title: "Disposables", list: disposables, badge: "", href: "/product-category/disposables" },
    { id: "concentrates", title: "Concentrates", list: concentrates, badge: "", href: "/product-category/concentrates" },
    { id: "edibles", title: "Edibles", list: edibles, badge: "", href: "/product-category/edibles" },
  ];

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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F5A50" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
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

        {/* Order mode (Delivery vs Pickup). Hidden on desktop by client CSS (>= 1100px) */}
        <div className="orderbtns">
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
        <p className="ordernote">Free delivery in DC · Pickup at 1000 G St NW</p>

        {/* Shop By Category */}
        <MobileCategoryGrid />

        <DeliverySteps />

        {/* Mobile / tablet rails (full-bleed horizontal scroll), same order as the client site */}
        <section className="sec" aria-labelledby="best-h">
          <div className="sec__head">
            <h2 id="best-h">Best Sellers</h2>
            <Link href="/shop?category=best-sellers">See all</Link>
          </div>
        </section>
        <div className="rail">
          {bestSellers.map((p) => (
            <ShopProductCard key={`m-${p.id}`} product={withBadge(p, "Best Seller")} />
          ))}
        </div>

        <section className="sec" aria-labelledby="new-h">
          <div className="sec__head">
            <h2 id="new-h">New Arrivals</h2>
            <Link href="/shop?category=new-arrivals">See all</Link>
          </div>
        </section>
        <div className="rail">
          {newArrivals.map((p) => (
            <ShopProductCard key={`m-${p.id}`} product={withBadge(p, "New")} />
          ))}
        </div>

        {/* Delivery areas (one block; client CSS lays it out for mobile and desktop) */}
        <section className="hoods" aria-labelledby="hoods-h">
          <div className="sec__head">
            <h2 id="hoods-h">We deliver to your neighborhood</h2>
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

        {/* Desktop sections (shown >= 1100px by client CSS), ids match the left menu */}
        <div className="dsecs">
          {desktopSections
            .filter((sec) => sec.list.length > 0)
            .map((sec) => (
              <section key={sec.id} className="dsec" id={sec.id}>
                <div className="sec__head">
                  <h2>{sec.title}</h2>
                  <Link href={sec.href}>See all</Link>
                </div>
                <div className="grid grid--3">
                  {sec.list.slice(0, 6).map((p) => (
                    <ShopProductCard key={`d-${p.id}`} product={withBadge(p, sec.badge)} />
                  ))}
                </div>
              </section>
            ))}
        </div>

        {/* About & FAQ */}
        <div className="dinfo">
          <section className="about">
            {/* The homepage H1 (client site: About section heading, nothing visible above the banner) */}
            <h1>Washington DC&apos;s Trusted Cannabis Delivery</h1>
            <p>
              Torch delivers top-shelf <Link href="/flowers">cannabis flower</Link>,{" "}
              <Link href="/product-category/pre-rolls">pre-rolls</Link>,{" "}
              <Link href="/product-category/disposables">disposable vapes</Link>, concentrates and{" "}
              <Link href="/product-category/edibles">edibles</Link> anywhere in Washington, DC, usually the
              same day. Order online or by phone, or choose curbside pickup at our Downtown location on G St
              NW.
            </p>
            <div id="about-more" hidden={!showFullLegalText}>
              <p>
                Adults 21 and older in DC can legally possess cannabis. Our team helps first-timers and
                longtime enthusiasts alike find the right strain, format and dose, with knowledgeable staff a
                phone call away.
              </p>
              <p style={{ marginTop: 12 }}>
                We serve Downtown, Adams Morgan, Dupont Circle, Capitol Hill, Navy Yard, Shaw, Georgetown and
                every neighborhood in between. Every order is packed discreetly and handed over only after a
                21+ ID check.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFullLegalText(!showFullLegalText)}
              className="linkbtn"
              aria-controls="about-more"
              aria-expanded={showFullLegalText}
            >
              {showFullLegalText ? "Show less" : "Read more"}
            </button>
          </section>

          <StoreFaqSection faqs={HOME_FAQS} />
        </div>
      </main>

      {/* 3. Right Cart Column */}
      <ShopCartSidebar />

      {/* 4. Mobile Floating Cart Bar */}
      <ShopStickyCartBar />
    </div>
  );
}
