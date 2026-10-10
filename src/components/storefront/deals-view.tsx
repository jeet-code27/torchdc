"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";

type TierKey = "midshelf" | "topshelf" | "private-reserve";

interface TierConfig {
  key: TierKey;
  label: string;
  tagline: string;
  wakeAndBake: {
    price: number;
    description: string;
  };
  doubleUp: Array<{
    amount: string;
    save: number;
    price: number;
  }>;
  stackAndSave: Array<{
    amount: string;
    save: number;
    price: number;
  }>;
  halfPoundHaul: {
    amount: string;
    save: number;
    price: number;
  };
}

const DEALS_DATA: Record<TierKey, TierConfig> = {
  midshelf: {
    key: "midshelf",
    label: "Midshelf",
    tagline: "Quality flower, priced for value.",
    wakeAndBake: {
      price: 50,
      description: "Half ounce of Midshelf for just",
    },
    doubleUp: [
      { amount: "2 half ounces", save: 30, price: 110 },
      { amount: "3 half ounces", save: 50, price: 160 },
      { amount: "4 half ounces", save: 70, price: 210 },
    ],
    stackAndSave: [
      { amount: "2 oz", save: 20, price: 180 },
      { amount: "3 oz", save: 40, price: 260 },
      { amount: "4 oz", save: 60, price: 340 },
    ],
    halfPoundHaul: {
      amount: "8 oz",
      save: 160,
      price: 640,
    },
  },
  topshelf: {
    key: "topshelf",
    label: "Topshelf",
    tagline: "Our core lineup, now in bulk.",
    wakeAndBake: {
      price: 70,
      description: "Half ounce of Topshelf for just",
    },
    doubleUp: [
      { amount: "2 half ounces", save: 50, price: 150 },
      { amount: "3 half ounces", save: 80, price: 220 },
      { amount: "4 half ounces", save: 120, price: 280 },
    ],
    stackAndSave: [
      { amount: "2 oz", save: 20, price: 260 },
      { amount: "3 oz", save: 60, price: 360 },
      { amount: "4 oz", save: 120, price: 440 },
    ],
    halfPoundHaul: {
      amount: "8 oz",
      save: 280,
      price: 840,
    },
  },
  "private-reserve": {
    key: "private-reserve",
    label: "Private Reserve",
    tagline: "Small-batch exotics, better by the ounce.",
    wakeAndBake: {
      price: 90,
      description: "Half ounce of Private Reserve for just",
    },
    doubleUp: [
      { amount: "2 half ounces", save: 60, price: 180 },
      { amount: "3 half ounces", save: 100, price: 260 },
      { amount: "4 half ounces", save: 140, price: 340 },
    ],
    stackAndSave: [
      { amount: "2 oz", save: 20, price: 360 },
      { amount: "3 oz", save: 50, price: 520 },
      { amount: "4 oz", save: 80, price: 680 },
    ],
    halfPoundHaul: {
      amount: "8 oz",
      save: 320,
      price: 1200,
    },
  },
};

export function DealsView() {
  const [selectedTier, setSelectedTier] = React.useState<TierKey>("midshelf");
  const current = DEALS_DATA[selectedTier];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3.5 sm:px-5 lg:px-6 py-4 sm:py-6">
      {/* ================= MOBILE QUICK CATEGORY NAVIGATION (lg:hidden) ================= */}
      <div className="lg:hidden mb-4 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-3.5 px-3.5">
          <Link
            href="/deals"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-[#5A805B] text-white shadow-xs"
          >
            Deals
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            All Products
          </Link>
          <Link
            href="/shop?category=flowers"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Flower
          </Link>
          <Link
            href="/shop?category=pre-rolls"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Pre-rolls
          </Link>
          <Link
            href="/shop?category=disposables"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Disposables
          </Link>
          <Link
            href="/shop?category=concentrates"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Concentrates
          </Link>
          <Link
            href="/shop?category=edibles"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Edibles
          </Link>
          <Link
            href="/shop?category=mushrooms"
            className="px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-white text-neutral-800 border border-neutral-200/90 hover:bg-neutral-50 shadow-2xs"
          >
            Mushrooms
          </Link>
        </div>
      </div>

      <div className="flex gap-4 lg:gap-6 xl:gap-8 items-start">
        {/* ================= 1. DESKTOP LEFT RAIL (Menu Navigation) ================= */}
        <div className="hidden lg:block shrink-0 sticky top-24 self-start">
          <ShopSidebar activeCategory="deals" />
        </div>

        {/* ================= 2. MAIN CENTER CONTENT (Deals Cards) ================= */}
        <main className="flex-1 min-w-0 space-y-5 sm:space-y-6 max-w-2xl lg:max-w-3xl">
          {/* ================= TIER SWITCHER TABS ================= */}
          <div className="bg-[#edf2ed] p-1 sm:p-1.5 rounded-full grid grid-cols-3 sm:inline-flex w-full sm:w-auto items-center max-w-md">
            {(["midshelf", "topshelf", "private-reserve"] as TierKey[]).map((tierKey) => {
              const isActive = selectedTier === tierKey;
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => setSelectedTier(tierKey)}
                  className={`px-2 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all text-center cursor-pointer truncate ${
                    isActive
                      ? "bg-[#5A805B] text-white shadow-xs font-extrabold"
                      : "text-neutral-700 hover:text-neutral-900 font-semibold"
                  }`}
                >
                  {DEALS_DATA[tierKey].label}
                </button>
              );
            })}
          </div>

          {/* ================= PAGE TITLE & TAGLINE ================= */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#C25E2E] block">
              BULK SAVINGS
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Deals
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              {current.tagline}
            </p>
          </div>

          {/* ================= 1. WAKE & BAKE CARD ================= */}
          <div className="bg-[#edf4ed] rounded-3xl p-5 sm:p-7 md:p-8 space-y-3 sm:space-y-3.5">
            <span className="inline-block bg-[#4a6f4c] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs">
              9AM TO 12PM ONLY
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#213f23] tracking-tight">
              Wake & Bake
            </h2>

            <p className="text-xs sm:text-sm text-neutral-700 font-medium">
              {current.wakeAndBake.description}
            </p>

            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-4xl sm:text-5xl font-black text-[#C25E2E] tracking-tight">
                ${current.wakeAndBake.price}
              </span>

              <Link
                href={`/shop?category=flowers&tier=${current.key}`}
                className="bg-[#111111] hover:bg-neutral-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-transform shadow-xs inline-flex items-center justify-center shrink-0"
              >
                Pick a strain
              </Link>
            </div>

            <p className="text-[11px] sm:text-xs text-neutral-500 font-medium pt-1 leading-relaxed">
              Limit 1 per customer per day. Applied automatically in your cart during these hours.
            </p>
          </div>

          {/* ================= 2. NEW HERE? PROMO CALLOUT ================= */}
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#5A805B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-neutral-900">
                New Here?
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                Let us know it&apos;s your first order and we&apos;ll throw in something on the house.
              </p>
            </div>
          </div>

          {/* ================= 3. DOUBLE UP CARD ================= */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Double Up
              </h2>
              <span className="bg-[#edf5ed] text-[#5A805B] text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Mix any {current.label} strains by the half ounce.
            </p>

            <div className="divide-y divide-neutral-100 pt-2">
              {current.doubleUp.map((deal, idx) => (
                <div
                  key={idx}
                  className="py-3.5 sm:py-4 flex items-center justify-between gap-4 first:pt-1 last:pb-1"
                >
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                      {deal.amount}
                    </h4>
                    <span className="text-xs text-neutral-500 font-medium">
                      Save ${deal.save}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="font-black text-base sm:text-lg text-neutral-900">
                      ${deal.price}
                    </span>
                    <Link
                      href={`/shop?category=flowers&tier=${current.key}`}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5A805B] hover:bg-[#486849] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                      aria-label={`Pick strain for ${deal.amount}`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 4. STACK & SAVE CARD ================= */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Stack & Save
              </h2>
              <span className="bg-[#edf5ed] text-[#5A805B] text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Stock up by the ounce and save more with every one.
            </p>

            <div className="divide-y divide-neutral-100 pt-2">
              {current.stackAndSave.map((deal, idx) => (
                <div
                  key={idx}
                  className="py-3.5 sm:py-4 flex items-center justify-between gap-4 first:pt-1 last:pb-1"
                >
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                      {deal.amount}
                    </h4>
                    <span className="text-xs text-neutral-500 font-medium">
                      Save ${deal.save}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="font-black text-base sm:text-lg text-neutral-900">
                      ${deal.price}
                    </span>
                    <Link
                      href={`/shop?category=flowers&tier=${current.key}`}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5A805B] hover:bg-[#486849] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                      aria-label={`Pick strain for ${deal.amount}`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= 5. THE HALF-POUND HAUL CARD ================= */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                The Half-Pound Haul
              </h2>
              <span className="bg-[#edf5ed] text-[#5A805B] text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                BIGGEST SAVINGS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Half a pound of {current.label} at our lowest price.
            </p>

            <div className="pt-2">
              <div className="py-3.5 sm:py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                    {current.halfPoundHaul.amount}
                  </h4>
                  <span className="text-xs text-neutral-500 font-medium">
                    Save ${current.halfPoundHaul.save}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="font-black text-base sm:text-lg text-neutral-900">
                    ${current.halfPoundHaul.price}
                  </span>
                  <Link
                    href={`/shop?category=flowers&tier=${current.key}`}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5A805B] hover:bg-[#486849] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    aria-label={`Pick strain for ${current.halfPoundHaul.amount}`}
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 6. AUTOMATIC DISCOUNT NOTE ================= */}
          <p className="text-xs text-neutral-400 text-center py-4 font-medium">
            Deals apply automatically in your cart when you add the matching flower.
          </p>
        </main>

        {/* ================= 3. DESKTOP RIGHT RAIL (Sticky Cart Sidebar) ================= */}
        <div className="hidden xl:block shrink-0 sticky top-24 self-start">
          <ShopCartSidebar />
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING CART BAR ================= */}
      <ShopStickyCartBar />
    </div>
  );
}
