"use client";

import * as React from "react";

export interface TierInfo {
  slug: string;
  name: string;
  subtitle: string;
  priceFrom: number;
  strainCount: string;
}

export const FLOWER_TIERS: TierInfo[] = [
  {
    slug: "midshelf",
    name: "Midshelf",
    subtitle: "Quality picks, priced for value",
    priceFrom: 70,
    strainCount: "7 strains",
  },
  {
    slug: "topshelf",
    name: "Topshelf",
    subtitle: "Our core lineup of classics",
    priceFrom: 40,
    strainCount: "20+ strains",
  },
  {
    slug: "exotic",
    name: "Private Reserve",
    subtitle: "Small-batch exotics",
    priceFrom: 60,
    strainCount: "8 strains",
  },
];

interface ShopFlowerTiersProps {
  activeTier: string;
  onSelectTier: (tierSlug: string) => void;
}

export function ShopFlowerTiers({
  activeTier,
  onSelectTier,
}: ShopFlowerTiersProps) {
  return (
    <div
      role="group"
      aria-label="Flower quality tiers"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4"
    >
      {FLOWER_TIERS.map((tier) => {
        const isActive = activeTier === tier.slug;
        return (
          <button
            key={tier.slug}
            type="button"
            onClick={() => onSelectTier(isActive ? "all" : tier.slug)}
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-left transition-all cursor-pointer border ${
              isActive
                ? "bg-[#557754] text-white border-[#557754] shadow-md shadow-[#557754]/20 scale-[1.01]"
                : "bg-white text-neutral-900 border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs"
            }`}
          >
            <div>
              <strong className="block text-[15px] sm:text-[16px] font-black">
                {tier.name}
              </strong>
              <span
                className={`block text-[12px] mt-0.5 line-clamp-1 ${
                  isActive ? "text-white/80" : "text-neutral-500"
                }`}
              >
                {tier.subtitle}
              </span>
            </div>

            <div className="text-right pl-2">
              <span
                className={`text-[11px] block font-medium ${
                  isActive ? "text-white/80" : "text-neutral-400"
                }`}
              >
                from
              </span>
              <span className="text-[17px] font-black leading-none">
                ${tier.priceFrom}
              </span>
              <span
                className={`text-[10px] block mt-0.5 ${
                  isActive ? "text-white/70" : "text-neutral-400"
                }`}
              >
                {tier.strainCount}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
