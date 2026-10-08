"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  ShoppingBag,
  Flame,
  Sparkles,
  ChevronRight,
  Phone,
} from "lucide-react";
import { useCart, FulfillmentType } from "@/context/cart-context";
import { ShopSidebar, STORE_CATEGORIES } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopFlowerTiers } from "./shop-flower-tiers";
import { ShopStrainFilters } from "./shop-strain-filters";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProductCard, ShopProduct } from "./shop-product-card";

// Comprehensive catalog items from the store inventory
const INITIAL_PRODUCTS: ShopProduct[] = [
  // --- BEST SELLERS ---
  {
    id: "bs-1",
    name: "Gelato (Hybrid)",
    slug: "gelato-hybrid",
    subtitle: "Topshelf · Hybrid · 3.5g",
    price: 40,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "topshelf",
    strain: "hybrid",
    weight: "3.5g",
    isBestSeller: true,
  },
  {
    id: "bs-2",
    name: "2G Plume Sweet Pop",
    slug: "2g-plume-sweet-pop",
    subtitle: "Berry Runtz x Fruit Tart",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
    category: "disposables",
    weight: "2g",
    isBestSeller: true,
  },
  {
    id: "bs-3",
    name: "Rocket Bites Orange Sun",
    slug: "rocket-bites-orange-sun",
    subtitle: "200mg · 10 ct Artisanal",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
    category: "edibles",
    weight: "200mg",
    isBestSeller: true,
  },
  {
    id: "bs-4",
    name: "Exotic 1G Pre-Roll",
    slug: "exotic-1g-pre-roll",
    subtitle: "Pre-roll · 1g Artisanal",
    price: 15,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
    category: "pre-rolls",
    weight: "1g",
    isBestSeller: true,
  },

  // --- NEW ARRIVALS ---
  {
    id: "na-1",
    name: "Jeeter Bananaconda",
    slug: "jeeter-bananaconda",
    subtitle: "Indica · enhanced 1g",
    price: 50,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
    category: "pre-rolls",
    strain: "indica",
    weight: "1g",
    isNewArrival: true,
  },
  {
    id: "na-2",
    name: "2G Plume Cherry Kamikaze",
    slug: "2g-plume-cherry-kamikaze",
    subtitle: "Tokyo Sunset x Cherry Soda",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
    category: "disposables",
    weight: "2g",
    isNewArrival: true,
  },
  {
    id: "na-3",
    name: "WM Zayaya + Key Lime Cake",
    slug: "wm-zayaya-key-lime-cake",
    subtitle: "Indica / Sativa dual pack",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
    category: "disposables",
    strain: "hybrid",
    weight: "2g",
    isNewArrival: true,
  },

  // --- FLOWERS: TOPSHELF ($40) ---
  {
    id: "fl-1",
    name: "Blue Dream",
    slug: "blue-dream",
    subtitle: "Topshelf · Sativa · 3.5g",
    price: 40,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "topshelf",
    strain: "sativa",
    weight: "3.5g",
  },
  {
    id: "fl-2",
    name: "Wedding Cake",
    slug: "wedding-cake",
    subtitle: "Topshelf · Indica · 3.5g",
    price: 40,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "topshelf",
    strain: "indica",
    weight: "3.5g",
  },
  {
    id: "fl-3",
    name: "Super Silver Haze",
    slug: "super-silver-haze",
    subtitle: "Topshelf · Sativa · 3.5g",
    price: 40,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "topshelf",
    strain: "sativa",
    weight: "3.5g",
  },

  // --- FLOWERS: PRIVATE RESERVE / EXOTIC ($60) ---
  {
    id: "fl-4",
    name: "Lemon Cherry Gelato",
    slug: "lemon-cherry-gelato",
    subtitle: "Private Reserve · Hybrid · 3.5g",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "exotic",
    strain: "hybrid",
    weight: "3.5g",
    badge: "EXOTIC",
  },
  {
    id: "fl-5",
    name: "Runtz Muffin",
    slug: "runtz-muffin",
    subtitle: "Private Reserve · Indica · 3.5g",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "exotic",
    strain: "indica",
    weight: "3.5g",
    badge: "EXOTIC",
  },

  // --- FLOWERS: MIDSHELF ($70) ---
  {
    id: "fl-6",
    name: "OG Kush",
    slug: "og-kush",
    subtitle: "Midshelf · Indica · 14g Half Oz",
    price: 70,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "midshelf",
    strain: "indica",
    weight: "14g",
  },
  {
    id: "fl-7",
    name: "Sour Diesel",
    slug: "sour-diesel",
    subtitle: "Midshelf · Sativa · 14g Half Oz",
    price: 70,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    category: "flowers",
    tier: "midshelf",
    strain: "sativa",
    weight: "14g",
  },

  // --- CONCENTRATES ---
  {
    id: "cc-1",
    name: "Torch Live Rosin Badder",
    slug: "torch-live-rosin-badder",
    subtitle: "Solventless 1g Artisanal",
    price: 75,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349262/torch/categories/j3j548jks994jfk2k1a0.jpg",
    category: "concentrates",
    weight: "1g",
  },

  // --- EDIBLES ---
  {
    id: "ed-1",
    name: "Gummy Bears 500mg Mega Pack",
    slug: "gummy-bears-500mg-mega-pack",
    subtitle: "Full Spectrum · 20 ct",
    price: 45,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
    category: "edibles",
    weight: "500mg",
  },

  // --- MUSHROOMS ---
  {
    id: "mu-1",
    name: "PolkaDot Magic Chocolate Bar",
    slug: "polkadot-magic-chocolate-bar",
    subtitle: "4g Premium Belgian Chocolate",
    price: 55,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
    category: "mushrooms",
    weight: "4g",
  },
];

export function ShopCatalog() {
  const { fulfillment, setFulfillment, totalCount } = useCart();

  const [activeCategory, setActiveCategory] = React.useState("all");
  const [activeTier, setActiveTier] = React.useState("all");
  const [activeStrain, setActiveStrain] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("popular");
  const [showTierModal, setShowTierModal] = React.useState(false);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSubtitle = product.subtitle?.toLowerCase().includes(q);
        if (!matchesName && !matchesSubtitle) return false;
      }

      // 2. Category Filter
      if (activeCategory === "best-sellers") {
        if (!product.isBestSeller) return false;
      } else if (activeCategory === "new-arrivals") {
        if (!product.isNewArrival) return false;
      } else if (activeCategory !== "all") {
        if (product.category !== activeCategory) return false;
      }

      // 3. Flower Tier Filter
      if (activeTier !== "all") {
        if (product.tier !== activeTier) return false;
      }

      // 4. Strain Filter
      if (activeStrain !== "all") {
        if (product.strain !== activeStrain) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "latest") return a.isNewArrival ? -1 : 1;
      return 0; // default popular
    });
  }, [activeCategory, activeTier, activeStrain, searchQuery, sortBy]);

  const categoryTitle = React.useMemo(() => {
    if (activeCategory === "all") return "Shop All";
    if (activeCategory === "best-sellers") return "Best Sellers";
    if (activeCategory === "new-arrivals") return "New Arrivals";
    const found = STORE_CATEGORIES.find((c) => c.slug === activeCategory);
    return found ? found.name : "Products";
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#fafbfa] text-neutral-900">
      {/* ================= DESKTOP HEADER (Screenshot 1) ================= */}
      <div className="hidden lg:block border-b border-neutral-200/70 bg-white">
        <div className="max-w-[1340px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" aria-label="Torch Home">
            <div className="relative w-36 h-12">
              <Image
                src="/images/torch-logo.svg"
                alt="Torch Dispensary"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Large Search Pill */}
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="What are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-sm text-neutral-800 placeholder-neutral-400 rounded-full pl-11 pr-4 py-3 outline-none border border-transparent focus:border-neutral-300 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Links & Phone */}
          <div className="flex items-center gap-6 text-sm font-bold text-neutral-700">
            <Link href="/deals" className="hover:text-[#557754] transition-colors">
              Deals
            </Link>
            <Link href="/about" className="hover:text-[#557754] transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-[#557754] transition-colors">
              Contact
            </Link>

            <a
              href="tel:+12024681966"
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#557754]" />
              <span>(202) 468-1966</span>
            </a>
          </div>
        </div>
      </div>

      {/* ================= MOBILE HEADER (Screenshot 3 & 4) ================= */}
      <div className="lg:hidden bg-white border-b border-neutral-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Back button */}
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Centered Logo */}
          <Link href="/" className="relative w-32 h-10">
            <Image
              src="/images/torch-logo.svg"
              alt="Torch"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Cart Icon Circle */}
          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-full bg-[#557754] text-white flex items-center justify-center shadow-xs"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E8561E] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                {totalCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Fulfillment Segmented Switch */}
        <div className="px-4 pb-2.5 pt-1">
          <div className="bg-neutral-100 p-1 rounded-full flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`flex-1 py-2 text-center rounded-full transition-all cursor-pointer ${
                fulfillment === "delivery"
                  ? "bg-[#557754] text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`flex-1 py-2 text-center rounded-full transition-all cursor-pointer ${
                fulfillment === "pickup"
                  ? "bg-[#557754] text-white shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Pickup
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 text-center mt-1.5">
            {fulfillment === "delivery"
              ? "Free same-day delivery across Washington, DC"
              : "Curbside pickup at 1025 F St NW, Washington, DC"}
          </p>
        </div>

        {/* Horizontal Category Rail */}
        <div className="px-4 py-2 border-t border-neutral-100 overflow-x-auto scrollbar-none flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("all");
              setActiveTier("all");
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            All
          </button>
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => {
                setActiveCategory(cat.slug);
                if (cat.slug !== "flowers") setActiveTier("all");
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.slug
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 border border-neutral-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-8 items-start">
          {/* ================= 1. DESKTOP LEFT RAIL (Screenshot 1) ================= */}
          <div className="hidden lg:block">
            <ShopSidebar
              activeCategory={activeCategory}
              onSelectCategory={(slug) => {
                setActiveCategory(slug);
                if (slug !== "flowers") setActiveTier("all");
              }}
            />
          </div>

          {/* ================= 2. CENTER PRODUCT FEED ================= */}
          <main className="flex-1 min-w-0">
            {/* Desktop Hero Wake & Bake Banner (Screenshot 1) */}
            <div className="relative rounded-3xl bg-[#557754] text-white p-6 sm:p-8 overflow-hidden shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative z-10 max-w-sm space-y-2 text-center sm:text-left">
                <span className="inline-block bg-[#E8561E] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  9AM TO 12PM DAILY
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white">
                  WAKE & BAKE
                </h2>
                <p className="text-white/85 text-sm sm:text-base leading-snug">
                  Half ounce from <strong className="text-white">$50</strong>. Limit 1 per customer daily.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("flowers");
                      setActiveTier("midshelf");
                    }}
                    className="inline-flex items-center gap-2 bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold text-sm px-6 py-2.5 rounded-full transition-all shadow-sm cursor-pointer"
                  >
                    <span>Grab it</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E8561E]" />
                  </button>
                </div>
              </div>

              {/* Graphic side */}
              <div className="relative w-48 sm:w-64 h-36 sm:h-44 flex-shrink-0">
                <Image
                  src="https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png"
                  alt="Wake and Bake flower jar"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>

            {/* Mobile Flower Tier Shortcut Banner (Screenshot 4) */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("flowers");
                  setShowTierModal(!showTierModal);
                }}
                className="w-full bg-[#edf4ed] border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <h4 className="font-extrabold text-[14px] text-[#2F4F30]">
                    Shop flower by tier
                  </h4>
                  <p className="text-[12px] text-neutral-600">
                    Midshelf · Topshelf · Private Reserve
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#557754]" />
              </button>
            </div>

            {/* Flower Tiers Section (When Flowers or All is selected) */}
            {(activeCategory === "all" || activeCategory === "flowers") && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#E8561E]">
                    Lab-Tested · Same-Day Delivery
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
                  Flowers
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mb-3">
                  Three tiers, one standard of quality.
                </p>

                {/* 3 Tier Cards */}
                <ShopFlowerTiers
                  activeTier={activeTier}
                  onSelectTier={(tier) => setActiveTier(tier)}
                />
              </div>
            )}

            {/* Filters & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-200/80">
              {/* Left: Section Title & Count */}
              <div>
                <h2 className="text-2xl font-black text-neutral-900 leading-tight">
                  {categoryTitle}
                </h2>
                <p className="text-xs text-neutral-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} available
                </p>
              </div>

              {/* Right: Strain Filters & Sort */}
              <div className="flex items-center gap-3 flex-wrap">
                <ShopStrainFilters
                  activeStrain={activeStrain}
                  onSelectStrain={(strain) => setActiveStrain(strain)}
                />

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-neutral-200 text-xs font-bold text-neutral-800 rounded-full px-3.5 py-1.5 outline-none hover:border-neutral-300 cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="latest">New Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 my-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-black text-lg text-neutral-900">
                  No products found
                </h3>
                <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, flower tier, or strain filter to see available DC menu items.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("all");
                    setActiveTier("all");
                    setActiveStrain("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 bg-[#557754] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#466645] transition-all cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                {filteredProducts.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

          {/* ================= 3. DESKTOP RIGHT ORDER DRAWER (Screenshot 1) ================= */}
          <div className="hidden lg:block">
            <ShopCartSidebar />
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING CART PILL ================= */}
      <ShopStickyCartBar />
    </div>
  );
}
