"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Flame, Sparkles, Sprout, Wind, Zap, Disc, Cookie, Cherry, Tag, Phone } from "lucide-react";

export interface CategoryOption {
  slug: string;
  name: string;
  icon?: React.ReactNode;
}

export const STORE_CATEGORIES: CategoryOption[] = [
  { slug: "all", name: "All Products", icon: <Tag className="w-4 h-4 text-[#5A805B]" /> },
  { slug: "best-sellers", name: "Best Sellers", icon: <Flame className="w-4 h-4 text-amber-500" /> },
  { slug: "new-arrivals", name: "New Arrivals", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
  { slug: "flowers", name: "Flowers", icon: <Sprout className="w-4 h-4 text-emerald-600" /> },
  { slug: "pre-rolls", name: "Pre-rolls", icon: <Wind className="w-4 h-4 text-blue-500" /> },
  { slug: "disposables", name: "Disposables", icon: <Zap className="w-4 h-4 text-orange-500" /> },
  { slug: "cartridges", name: "Cartridges", icon: <Disc className="w-4 h-4 text-purple-500" /> },
  { slug: "concentrates", name: "Concentrates", icon: <Disc className="w-4 h-4 text-amber-600" /> },
  { slug: "edibles", name: "Edibles", icon: <Cookie className="w-4 h-4 text-rose-500" /> },
  { slug: "mushrooms", name: "Mushrooms", icon: <Cherry className="w-4 h-4 text-teal-600" /> },
  { slug: "deals", name: "Deals", icon: <Tag className="w-4 h-4 text-[#5A805B]" /> },
];

interface ShopSidebarProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
  scrollLinks?: boolean;
}

export function ShopSidebar({
  activeCategory = "all",
  onSelectCategory,
  scrollLinks = false,
}: ShopSidebarProps) {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    if (slug === "deals") {
      router.push("/deals");
      return;
    }
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    if (scrollLinks) {
      const el = document.getElementById(`section-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <aside className="w-44 xl:w-48 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none pr-1">
      <div className="space-y-6 pb-8">
        {/* ================= DISPENSARY MENU ================= */}
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-3">
            Menu
          </span>

          <nav className="flex flex-col gap-0.5" aria-label="Dispensary menu">
            {STORE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#5A805B]/10 text-[#5A805B] font-extrabold shadow-2xs"
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
        <div className="p-3.5 bg-[#5A805B]/10 rounded-2xl border border-[#5A805B]/20 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#5A805B] mb-1">
            <Tag className="w-3.5 h-3.5 text-[#5A805B]" />
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
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5A805B] hover:underline pt-0.5"
          >
            <Phone className="w-3 h-3" />
            <span>(202) 468-1966</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
