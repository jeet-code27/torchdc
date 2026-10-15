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
      className="tiers"
      style={{ margin: "14px 0 18px", padding: 0 }}
    >
      {FLOWER_TIERS.map((tier) => {
        const isActive = activeTier === tier.slug;
        return (
          <button
            key={tier.slug}
            type="button"
            onClick={() => onSelectTier(isActive ? "all" : tier.slug)}
            className={`tier ${isActive ? "is-on" : ""}`}
          >
            <span className="tier__l">
              <span className="tier__n">{tier.name}</span>
              <span className="tier__d">{tier.subtitle}</span>
            </span>
            <span className="tier__c">{tier.strainCount}</span>
          </button>
        );
      })}
    </div>
  );
}
