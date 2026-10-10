"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ShopProductCard, ShopProduct } from "./shop-product-card";

interface ProductSliderProps {
  id?: string;
  title: string;
  seeAllHref: string;
  products: ShopProduct[];
  defaultBadge?: string;
}

export function ProductSlider({
  id,
  title,
  seeAllHref,
  products,
  defaultBadge,
}: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <section id={id} className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          {title}
        </h2>
        <Link
          href={seeAllHref}
          className="text-xs sm:text-sm font-bold text-[#5A805B] hover:underline flex items-center gap-1"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 1. Mobile Horizontal Slider (< lg screens) */}
      <div className="lg:hidden flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 -mx-3 px-3 scroll-smooth">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="w-[155px] sm:w-[170px] shrink-0"
          >
            <ShopProductCard
              product={defaultBadge && !prod.badge ? { ...prod, badge: defaultBadge } : prod}
            />
          </div>
        ))}
      </div>

      {/* 2. Desktop Grid (≥ lg screens) */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((prod) => (
          <ShopProductCard
            key={prod.id}
            product={defaultBadge && !prod.badge ? { ...prod, badge: defaultBadge } : prod}
          />
        ))}
      </div>
    </section>
  );
}
