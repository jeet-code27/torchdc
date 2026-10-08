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
  ChevronLeft,
  ChevronRight,
  Phone,
  Menu,
  X,
  Tag,
  Filter,
  Home,
  Info,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useCart, FulfillmentType } from "@/context/cart-context";
import { ShopSidebar, STORE_CATEGORIES } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopFlowerTiers } from "./shop-flower-tiers";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProductCard, ShopProduct } from "./shop-product-card";
import { StoreHeroCarousel } from "./store-hero-carousel";

const ITEMS_PER_PAGE = 12;

const CATEGORY_PILLS = [
  { slug: "all", label: "All" },
  { slug: "flowers", label: "Flower" },
  { slug: "pre-rolls", label: "Pre-rolls" },
  { slug: "disposables", label: "Disposables" },
  { slug: "cartridges", label: "Cartridges" },
  { slug: "concentrates", label: "Concentrates" },
  { slug: "edibles", label: "Edibles" },
  { slug: "mushrooms", label: "Mushrooms" },
  { slug: "best-sellers", label: "Best Sellers" },
  { slug: "new-arrivals", label: "New Arrivals" },
];

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

interface ShopCatalogProps {
  initialProducts?: ShopProduct[];
}

export function ShopCatalog({ initialProducts = [] }: ShopCatalogProps) {
  const { fulfillment, setFulfillment, totalCount } = useCart();
  const [products, setProducts] = React.useState<ShopProduct[]>(initialProducts);

  React.useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  // By default, Shop page shows ALL products
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [activeTier, setActiveTier] = React.useState("all");
  const [activeStrain, setActiveStrain] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("popular");
  const [showTierModal, setShowTierModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
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
  }, [products, activeCategory, activeTier, activeStrain, searchQuery, sortBy]);

  // Reset page when any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeTier, activeStrain, searchQuery, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const categoryTitle = React.useMemo(() => {
    if (activeCategory === "all") return "Shop All";
    if (activeCategory === "flowers") return "Flower";
    if (activeCategory === "best-sellers") return "Best Sellers";
    if (activeCategory === "new-arrivals") return "New Arrivals";
    const found = CATEGORY_PILLS.find((c) => c.slug === activeCategory);
    return found ? found.label : "Products";
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
            <Link href="/" className="hover:text-[#557754] transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-[#557754] font-black transition-colors">
              Shop All
            </Link>
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

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 bg-[#557754] hover:bg-[#466645] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-xs hover:shadow transition-all group"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
              <span className="w-4 h-4 rounded-full bg-white/25 text-white text-[10px] flex items-center justify-center font-bold">
                {totalCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MOBILE HEADER (Matching Home page header layout) ================= */}
      <div className="lg:hidden bg-white border-b border-neutral-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Phone Call button */}
          <div className="flex items-center">
            <a
              href="tel:+12024681966"
              className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 flex items-center justify-center transition-colors"
              aria-label="Call Torch DC"
              title="Call (202) 468-1966"
            >
              <Phone className="w-4 h-4 text-[#557754]" />
            </a>
          </div>

          {/* Centered Logo (links to Home) */}
          <Link href="/" className="relative w-32 h-10">
            <Image
              src="/images/torch-logo.svg"
              alt="Torch"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Right: Cart Icon Circle + Hamburger Menu (Matching Home page!) */}
          <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="Open navigation menu"
              title="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ================= MOBILE SLIDE-OVER SIDEBAR DRAWER (Slides from LEFT) ================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-start">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Panel (Slides from LEFT) */}
            <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
              {/* Top Bar */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="relative w-32 h-10">
                  <Image
                    src="/images/torch-logo.svg"
                    alt="Torch Dispensary"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* 1. PRIMARY SITE NAVIGATION (Home, Shop, Deals, About, Contact) */}
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                    Navigation
                  </span>
                  <nav className="space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Home className="w-4 h-4 text-[#557754]" />
                        <span>Home</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </Link>

                    <Link
                      href="/shop"
                      onClick={() => {
                        setActiveCategory("all");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-[#557754]" />
                        <span>Shop All</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </Link>

                    <Link
                      href="/deals"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-[#2F4F30] bg-[#edf4ed] hover:bg-[#e4ede4] transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Flame className="w-4 h-4 text-[#E8561E]" />
                        <span>Today&apos;s Deals</span>
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8561E] text-white">
                        HOT
                      </span>
                    </Link>

                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-[#557754]" />
                        <span>About Us</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#557754]" />
                        <span>Contact</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </Link>

                    <Link
                      href="/#faq"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-bold text-neutral-800 hover:bg-neutral-50 transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-[#557754]" />
                        <span>FAQs & Help</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </Link>
                  </nav>
                </div>

                {/* 2. DISPENSARY MENU CATEGORIES */}
                <div className="pt-3 border-t border-neutral-100">
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                    Shop Categories
                  </span>
                  <nav className="space-y-1">
                    {STORE_CATEGORIES.map((cat) => {
                      const isActive = activeCategory === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat.slug);
                            if (cat.slug !== "flowers") setActiveTier("all");
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                            isActive
                              ? "bg-[#edf4ed] text-[#2F4F30] font-black"
                              : "text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {cat.icon}
                            <span>{cat.name}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 3. ORDER MODE SWITCH */}
                <div className="pt-3 border-t border-neutral-100">
                  <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                    Order Mode
                  </span>
                  <div className="bg-neutral-100 p-1 rounded-full flex text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFulfillment("delivery")}
                      className={`flex-1 py-2 text-center rounded-full transition-all ${
                        fulfillment === "delivery"
                          ? "bg-[#557754] text-white font-black shadow-xs"
                          : "text-neutral-600"
                      }`}
                    >
                      Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillment("pickup")}
                      className={`flex-1 py-2 text-center rounded-full transition-all ${
                        fulfillment === "pickup"
                          ? "bg-[#557754] text-white font-black shadow-xs"
                          : "text-neutral-600"
                      }`}
                    >
                      Pickup
                    </button>
                  </div>
                </div>

                {/* 4. CALL SUPPORT BUTTON & INFO */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <a
                    href="tel:+12024681966"
                    className="w-full bg-[#557754] hover:bg-[#466645] text-white font-bold text-xs py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call (202) 468-1966</span>
                  </a>
                  <p className="text-[11px] text-neutral-400 text-center leading-normal">
                    1025 F St NW, Washington, DC · Open daily 7AM - 11PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {/* Hero Slider Carousel */}
            <StoreHeroCarousel compact={true} />

            {/* Category Filter Pills (Matching Client Reference) */}
            <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0">
              {CATEGORY_PILLS.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.slug);
                      if (cat.slug !== "flowers") setActiveTier("all");
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-xs font-black"
                        : "bg-white text-neutral-800 border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 shadow-2xs"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Catalog Grid Section with Pagination */}
            <div id="catalog-top">
              {/* Header Bar: Title, Count & Sort (Responsive Single-Line Layout) */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 pb-2 mb-3">
                {/* Left: Section Title & Count */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 leading-tight truncate">
                    {categoryTitle}
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5 truncate">
                    {filteredProducts.length === 0
                      ? "0 products"
                      : `${filteredProducts.length} products`}
                  </p>
                </div>

                {/* Right: Sort Button (Compact on mobile, full on desktop, never wraps) */}
                <div className="relative shrink-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-neutral-200/90 rounded-full px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-neutral-800 shadow-2xs hover:border-neutral-300 transition-colors pointer-events-none whitespace-nowrap">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    {/* Full label on tablet/desktop */}
                    <span className="hidden sm:inline">
                      {sortBy === "popular"
                        ? "Popular"
                        : sortBy === "price-asc"
                        ? "Price: Low to High"
                        : sortBy === "price-desc"
                        ? "Price: High to Low"
                        : "New Arrivals"}
                    </span>
                    {/* Compact label on mobile to fit nicely in 1 line */}
                    <span className="sm:hidden">
                      {sortBy === "popular"
                        ? "Popular"
                        : sortBy === "price-asc"
                        ? "Price: Low"
                        : sortBy === "price-desc"
                        ? "Price: High"
                        : "New"}
                    </span>
                    <ChevronRight className="w-3 h-3 text-neutral-400 rotate-90 shrink-0" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Sort products"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="latest">New Arrivals</option>
                  </select>
                </div>
              </div>

              {/* Mobile Flower Tier Shortcut Banner (Screenshot 2 / Client reference position) */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("flowers");
                    setShowTierModal(!showTierModal);
                  }}
                  className="w-full bg-[#edf4ed] border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#e4eee4] transition-colors"
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

              {/* Flower Tiers Section (STRICTLY ONLY WHEN FLOWERS CATEGORY IS SELECTED) */}
              {activeCategory === "flowers" && (
                <div className="mb-6 animate-in fade-in duration-200">
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

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 my-6 shadow-2xs">
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
                    className="mt-4 bg-[#557754] text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-[#466645] transition-all cursor-pointer shadow-xs"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                    {paginatedProducts.map((product) => (
                      <ShopProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Modern Smart Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="mt-12 pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Left: Product count stats */}
                      <p className="text-xs text-neutral-500 font-medium">
                        Showing{" "}
                        <span className="font-bold text-neutral-900">
                          {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-neutral-900">
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            filteredProducts.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-neutral-900">
                          {filteredProducts.length}
                        </span>{" "}
                        products
                      </p>

                      {/* Right: Modern Compact Pagination Controls */}
                      <div className="flex items-center gap-1.5 select-none">
                        {/* Previous Button */}
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                            document
                              .getElementById("catalog-top")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="h-9 px-3.5 rounded-xl text-xs font-bold border border-neutral-200/90 bg-white text-neutral-700 hover:bg-[#557754]/5 hover:border-[#557754]/40 hover:text-[#557754] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>

                        {/* Mobile indicator (Page X of Y) */}
                        <div className="flex sm:hidden items-center px-3 text-xs font-bold text-neutral-700 bg-neutral-100 rounded-xl h-9">
                          Page {currentPage} of {totalPages}
                        </div>

                        {/* Desktop / Tablet Number Pills with Smart Truncation */}
                        <div className="hidden sm:flex items-center gap-1">
                          {getPageNumbers(currentPage, totalPages).map((item, idx) => {
                            if (typeof item === "string") {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-8 h-9 flex items-center justify-center text-xs font-black text-neutral-400"
                                >
                                  …
                                </span>
                              );
                            }

                            const isActive = currentPage === item;
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setCurrentPage(item);
                                  document
                                    .getElementById("catalog-top")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                  isActive
                                    ? "bg-[#557754] text-white font-black shadow-xs ring-2 ring-[#557754]/25 scale-105"
                                    : "bg-white text-neutral-700 border border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50 shadow-2xs"
                                }`}
                                aria-label={`Page ${item}`}
                                aria-current={isActive ? "page" : undefined}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            );
                            document
                              .getElementById("catalog-top")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="h-9 px-3.5 rounded-xl text-xs font-bold border border-neutral-200/90 bg-white text-neutral-700 hover:bg-[#557754]/5 hover:border-[#557754]/40 hover:text-[#557754] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          aria-label="Next page"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
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
