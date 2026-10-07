"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Star } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  regularPrice?: number;
  image: string;
  badge?: string;
  strain?: "Indica" | "Sativa" | "Hybrid";
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Torch Reserve Master Kush 3.5g",
    category: "Flowers",
    price: 45,
    regularPrice: 55,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    badge: "Staff Pick",
    strain: "Indica",
  },
  {
    id: "2",
    name: "Artisanal Diamond Infused Pre-Roll 5-Pack",
    category: "Pre-Rolls",
    price: 40,
    regularPrice: 50,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
    badge: "Best Value",
    strain: "Hybrid",
  },
  {
    id: "3",
    name: "Torch Pure Live Resin 2g Disposable",
    category: "Disposables",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
    badge: "Popular",
    strain: "Sativa",
  },
  {
    id: "4",
    name: "Torch Solventless Live Rosin Badder 1g",
    category: "Concentrates",
    price: 65,
    regularPrice: 75,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349260/torch/categories/oqss4sy7kolhfwcg3kjn.jpg",
    badge: "Top Shelf",
    strain: "Indica",
  },
];

export function StoreFeaturedProducts() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Featured Specials & Top Shelf
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Hand-curated premium selections available for DC delivery & pickup
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-bold text-[#557754] hover:text-[#415e40] hover:underline transition-colors shrink-0"
        >
          View all
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {FEATURED_PRODUCTS.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden p-3 sm:p-4"
          >
            {/* Top Badges */}
            <div className="flex items-center justify-between gap-1 mb-2">
              {item.strain && (
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.strain === "Indica"
                      ? "bg-purple-100 text-purple-700"
                      : item.strain === "Sativa"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.strain}
                </span>
              )}
              {item.badge && (
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#557754]/10 text-[#557754] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Product Image */}
            <div className="relative w-full aspect-square my-2 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 250px"
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {item.category}
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 line-clamp-2 mt-0.5 min-h-[36px] group-hover:text-[#557754] transition-colors">
                {item.name}
              </h3>

              {/* Price & Add to Cart */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base sm:text-lg font-black text-gray-900">
                    ${item.price}
                  </span>
                  {item.regularPrice && (
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      ${item.regularPrice}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Add ${item.name} to cart`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#557754] hover:bg-[#466545] active:bg-[#3c563b] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
