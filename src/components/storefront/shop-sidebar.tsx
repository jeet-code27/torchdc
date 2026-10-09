"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Flame, Sparkles, Sprout, Wind, Zap, Disc, Cookie, Cherry, Tag, Info, Phone } from "lucide-react";

export interface CategoryOption {
  slug: string;
  name: string;
  icon?: React.ReactNode;
}

export const STORE_CATEGORIES: CategoryOption[] = [
  { slug: "all", name: "All Products", icon: <Tag className="w-4 h-4 text-[#557754]" /> },
  { slug: "best-sellers", name: "Best Sellers", icon: <Flame className="w-4 h-4 text-amber-500" /> },
  { slug: "new-arrivals", name: "New Arrivals", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
  { slug: "flowers", name: "Flowers", icon: <Sprout className="w-4 h-4 text-emerald-600" /> },
  { slug: "pre-rolls", name: "Pre-rolls", icon: <Wind className="w-4 h-4 text-blue-500" /> },
  { slug: "disposables", name: "Disposables", icon: <Zap className="w-4 h-4 text-orange-500" /> },
  { slug: "cartridges", name: "Cartridges", icon: <Disc className="w-4 h-4 text-purple-500" /> },
  { slug: "concentrates", name: "Concentrates", icon: <Disc className="w-4 h-4 text-amber-600" /> },
  { slug: "edibles", name: "Edibles", icon: <Cookie className="w-4 h-4 text-rose-500" /> },
  { slug: "mushrooms", name: "Mushrooms", icon: <Cherry className="w-4 h-4 text-teal-600" /> },
];

interface ShopSidebarProps {
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function ShopSidebar({
  activeCategory,
  onSelectCategory,
}: ShopSidebarProps) {
  return (
    <aside className="w-48 xl:w-52 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none pr-1">
      <div className="space-y-6 pb-8">
        {/* ================= 1. SITE NAVIGATION (Home, Deals, About, Contact) ================= */}
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-3">
            Navigation
          </span>
          <nav className="flex flex-col gap-1" aria-label="Main navigation links">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[14px] font-bold text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900 transition-colors"
            >
              <Home className="w-4 h-4 text-[#557754]" />
              <span>Home</span>
            </Link>
            <Link
              href="/deals"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[14px] font-bold text-[#2F4F30] hover:bg-[#edf4ed] transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-[#E8561E]" />
                <span>Today&apos;s Deals</span>
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#E8561E] text-white">
                Hot
              </span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[14px] font-bold text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900 transition-colors"
            >
              <Info className="w-4 h-4 text-neutral-500" />
              <span>About Us</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[14px] font-bold text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900 transition-colors"
            >
              <Phone className="w-4 h-4 text-neutral-500" />
              <span>Contact</span>
            </Link>
          </nav>
        </div>

        {/* ================= 2. DISPENSARY MENU CATEGORIES ================= */}
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-3">
            Menu Categories
          </span>

          <nav className="flex flex-col gap-1" aria-label="Dispensary menu categories">
            {STORE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#edf4ed] text-[#2F4F30] font-extrabold shadow-2xs"
                      : "text-neutral-700 hover:bg-neutral-100/70 hover:text-neutral-900"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Promo box */}
        <div className="p-3.5 bg-[#f5f8f5] rounded-2xl border border-emerald-100/60 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#2F4F30] mb-1">
            <Tag className="w-3.5 h-3.5 text-[#557754]" />
            <span>Daily Wake & Bake</span>
          </div>
          <p className="text-neutral-600 leading-snug">
            Save every morning 9AM - 12PM on half ounces across DC!
          </p>
        </div>

        {/* Store Hours & Quick Contact */}
        <div className="p-3.5 bg-white rounded-2xl border border-neutral-200/80 text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-extrabold text-neutral-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open Daily 7AM - 11PM</span>
          </div>
          <p className="text-[11px] text-neutral-500 font-medium">
            1025 F St NW, Washington, DC
          </p>
          <a
            href="tel:+12024681966"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#557754] hover:underline pt-0.5"
          >
            <Phone className="w-3 h-3" />
            <span>(202) 468-1966</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
