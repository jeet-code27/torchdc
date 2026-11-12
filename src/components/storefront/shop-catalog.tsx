"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopFlowerTiers, FLOWER_TIERS } from "./shop-flower-tiers";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProductCard, ShopProduct } from "./shop-product-card";
import { FaqSection, defaultCategoryCopy, type CategoryCopy } from "@/lib/category-content";

const CATEGORY_PILLS = [
  { slug: "all", label: "All" },
  { slug: "flowers", label: "Flower" },
  { slug: "pre-rolls", label: "Pre-rolls" },
  { slug: "disposables", label: "Disposables" },
  { slug: "cartridges", label: "Cartridges" },
  { slug: "concentrates", label: "Concentrates" },
  { slug: "edibles", label: "Edibles" },
];

interface ShopCatalogProps {
  initialProducts?: ShopProduct[];
  initialCategory?: string;
  initialQuery?: string;
  /** Category page text from Admin › Categories, for initialCategory */
  copy?: CategoryCopy;
  /** Shop All heading from Admin › SEO */
  allH1?: string;
}

/** Shop page, built on the client reference markup (shop.html + shopPage() in site.js). */
export function ShopCatalog({
  initialProducts = [],
  initialCategory,
  initialQuery = "",
  copy,
  allH1,
}: ShopCatalogProps) {
  const { fulfillment, setFulfillment } = useCart();
  const products = initialProducts;

  // Links like /shop?mode=delivery (client site Delivery / Pickup buttons) pick the order mode
  React.useEffect(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    if (mode === "delivery" || mode === "pickup") setFulfillment(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "best" / "new" are sorts on the client site; categories are tabs.
  // The page remounts this component (key) when the URL's category or search changes.
  const initial = initialCategory || "all";
  const [activeCategory, setActiveCategory] = React.useState(initial);
  const [activeTier, setActiveTier] = React.useState("topshelf");
  const [searchQuery, setSearchQuery] = React.useState(initialQuery || "");
  const [searchInput, setSearchInput] = React.useState(initialQuery || "");

  const isBest = activeCategory === "best" || activeCategory === "best-sellers";
  const isNew = activeCategory === "new" || activeCategory === "new-arrivals";
  const isFlowers = activeCategory === "flowers";
  const tab = isBest || isNew ? "all" : activeCategory;

  const tierCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      if (p.category === "flowers" && p.tier) counts[p.tier] = (counts[p.tier] || 0) + 1;
    }
    return counts;
  }, [products]);

  const filteredProducts = React.useMemo(() => {
    const words = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (tab !== "all" && (p.category || "").toLowerCase() !== tab) return false;
      if (isFlowers && p.tier !== activeTier) return false;
      if (words.length) {
        const hay = `${p.name} ${p.subtitle || ""} ${p.strain || ""} ${p.tier || ""} ${p.category || ""}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      }
      if (isBest) return Boolean(p.isBestSeller);
      if (isNew) return Boolean(p.isNewArrival);
      return true;
    });
  }, [products, tab, isFlowers, activeTier, searchQuery, isBest, isNew]);

  const title = searchQuery.trim()
    ? `Results for "${searchQuery.trim()}"`
    : isBest
    ? "Best Sellers"
    : isNew
    ? "New Arrivals"
    : tab === "all"
    ? allH1 || "Shop All"
    : isFlowers
    ? `${FLOWER_TIERS.find((t) => t.slug === activeTier)?.name || "Topshelf"} Flower`
    : CATEGORY_PILLS.find((c) => c.slug === tab)?.label || "Products";

  // Client cards: flame on best sellers (except in New Arrivals), NEW badge only in New Arrivals
  const catCopy = !searchQuery.trim() && !isBest && !isNew && tab !== "all" && tab !== "flowers";
  // Saved copy for the page's own category; the built-in copy when another tab is picked
  const cc = copy && tab === initial ? copy : defaultCategoryCopy(tab);

  const cardProduct = (p: ShopProduct): ShopProduct =>
    isNew
      ? { ...p, badge: p.isNewArrival ? "New" : undefined }
      : { ...p, isNewArrival: false, badge: p.isBestSeller ? p.badge : undefined };

  const selectTab = (slug: string) => {
    setActiveCategory(slug);
    setSearchQuery("");
    setSearchInput("");
    // Same URLs as the client site: categories have their own pages under /product-category/
    const url =
      slug === "all"
        ? "/shop"
        : ["pre-rolls", "disposables", "cartridges", "concentrates", "edibles"].includes(slug)
        ? `/product-category/${slug}`
        : `/shop?category=${slug}`;
    window.history.replaceState(null, "", url);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="shell">
      <ShopSidebar
        activeCategory={tab === "all" ? (isBest ? "best" : isNew ? "new" : "") : tab}
        onSelectCategory={selectTab}
      />

      <main className="shell__main">
        <form className="search" role="search" onSubmit={handleSearch}>
          <label htmlFor="q" className="sr-only">
            Search the menu
          </label>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F5A50" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="What are you looking for today?"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="shopbar">
          <div className="seg seg--green" role="tablist" aria-label="Delivery or pickup">
            <button
              type="button"
              role="tab"
              aria-selected={fulfillment === "delivery"}
              className={fulfillment === "delivery" ? "is-on" : ""}
              onClick={() => setFulfillment("delivery")}
            >
              Delivery
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={fulfillment === "pickup"}
              className={fulfillment === "pickup" ? "is-on" : ""}
              onClick={() => setFulfillment("pickup")}
            >
              Pickup
            </button>
          </div>
          <div className="shopbar__note">
            {fulfillment === "delivery" ? "Free delivery across DC" : "Pickup at 1000 G St NW"}
          </div>
          <div className="chips rail-x" role="tablist" aria-label="Categories">
            {CATEGORY_PILLS.map((cat) => {
              const on = tab === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`chip ${on ? "is-on" : ""}`}
                  onClick={() => selectTab(cat.slug)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pagehead">
          <div>
            {/* Category label, intro and FAQ: only on that category's own tab, not during a search */}
            {catCopy && cc.label && <span className="eyebrow catlabel">{cc.label}</span>}
            <h1>{catCopy && cc.h1 ? cc.h1 : title}</h1>
            <span className="muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>
        </div>

        {catCopy && cc.intro && <p className="catintro" dangerouslySetInnerHTML={{ __html: cc.intro }} />}

        {tab === "all" && !searchQuery.trim() && (
          <Link className="tierlink" href="/flowers">
            <span>
              <strong>Shop flower by tier</strong>
              <span>Midshelf · Topshelf · Exotic</span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        )}

        {isFlowers && (
          <ShopFlowerTiers activeTier={activeTier} onSelectTier={setActiveTier} counts={tierCounts} />
        )}

        <div className="grid" aria-live="polite">
          {filteredProducts.length ? (
            filteredProducts.map((p) => <ShopProductCard key={p.id} product={cardProduct(p)} />)
          ) : (
            <div className="empty">
              <strong>Nothing here yet</strong>
              <span>Try another category or search.</span>
            </div>
          )}
        </div>

        {catCopy && cc.faq.length > 0 && <FaqSection title={cc.faqTitle} items={cc.faq} headingId="cat-faq-h" />}
      </main>

      <ShopCartSidebar />
      <ShopStickyCartBar />
    </div>
  );
}
