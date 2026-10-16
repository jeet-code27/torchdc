"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProduct, ShopProductCard } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";
import { StoreFaqSection, HOME_FAQS } from "./store-faq-section";
import { MobileCategoryGrid } from "./mobile-category-grid";

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

  const mushrooms = React.useMemo(() => {
    const list = products.filter((p) => p.category === "mushrooms");
    return list.length > 0 ? list.slice(0, 6) : products.slice(0, 6);
  }, [products]);

  // Desktop sections, same order as the client site: Best Sellers, New Arrivals, then each category
  const desktopSections = [
    { id: "best", title: "Best Sellers", list: bestSellers, badge: "Best Seller", href: "/shop?category=best-sellers" },
    { id: "new", title: "New Arrivals", list: newArrivals, badge: "New", href: "/shop?category=new-arrivals" },
    { id: "flowers", title: "Flowers", list: flowers, badge: "", href: "/flowers" },
    { id: "pre-rolls", title: "Pre-rolls", list: preRolls, badge: "", href: "/shop?category=pre-rolls" },
    { id: "disposables", title: "Disposables", list: disposables, badge: "", href: "/shop?category=disposables" },
    { id: "concentrates", title: "Concentrates", list: concentrates, badge: "", href: "/shop?category=concentrates" },
    { id: "edibles", title: "Edibles", list: edibles, badge: "", href: "/shop?category=edibles" },
    { id: "mushrooms", title: "Mushrooms", list: mushrooms, badge: "", href: "/shop?category=mushrooms" },
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

        {/* Delivery in 3 easy steps (Mobile only, with client SVG icons) */}
        <section className="steps" aria-labelledby="steps-h">
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
            <h2>Washington DC&apos;s Trusted Cannabis Delivery</h2>
            <p>
              Torch delivers top-shelf <Link href="/flowers">cannabis flower</Link>,{" "}
              <Link href="/shop?category=pre-rolls">pre-rolls</Link>,{" "}
              <Link href="/shop?category=disposables">disposable vapes</Link>, concentrates and{" "}
              <Link href="/shop?category=edibles">edibles</Link> anywhere in Washington, DC, usually the
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
