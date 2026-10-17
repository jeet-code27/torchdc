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
    name: "Exotic",
    subtitle: "Small-batch, hard-to-find strains",
    priceFrom: 60,
    strainCount: "8 strains",
  },
];

interface ShopFlowerTiersProps {
  activeTier: string;
  onSelectTier: (tierSlug: string) => void;
  /** Live strain count per tier slug; falls back to the static label when missing. */
  counts?: Record<string, number>;
}

export function ShopFlowerTiers({ activeTier, onSelectTier, counts }: ShopFlowerTiersProps) {
  return (
    <div className="tiers">
      {FLOWER_TIERS.map((tier) => {
        const isActive = activeTier === tier.slug;
        const n = counts?.[tier.slug];
        return (
          <button
            key={tier.slug}
            type="button"
            onClick={() => onSelectTier(tier.slug)}
            className={`tier ${isActive ? "is-on" : ""}`}
            aria-pressed={isActive}
          >
            <span className="tier__l">
              <span className="tier__n">{tier.name}</span>
              <span className="tier__d">{tier.subtitle}</span>
            </span>
            <span className="tier__c">{n ? `${n} ${n === 1 ? "strain" : "strains"}` : tier.strainCount}</span>
          </button>
        );
      })}
    </div>
  );
}
