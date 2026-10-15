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
    <section id={id} className="sec">
      <div className="sec__head">
        <h2>{title}</h2>
        <Link href={seeAllHref}>See all</Link>
      </div>

      {/* 1. Mobile Horizontal Snap Rail (Only on mobile/tablets < 1024px) */}
      <div className="block lg:!hidden">
        <div className="rail">
          {products.map((prod) => (
            <ShopProductCard
              key={`m-${prod.id}`}
              product={defaultBadge && !prod.badge ? { ...prod, badge: defaultBadge } : prod}
            />
          ))}
        </div>
      </div>

      {/* 2. Desktop Uniform 3-Column Grid (Only on desktop >= 1024px) */}
      <div className="hidden lg:!block">
        <div className="grid">
          {products.map((prod) => (
            <ShopProductCard
              key={`d-${prod.id}`}
              product={defaultBadge && !prod.badge ? { ...prod, badge: defaultBadge } : prod}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
