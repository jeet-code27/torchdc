"use client";

import * as React from "react";

const STRAIN_OPTIONS = [
  { slug: "all", label: "All" },
  { slug: "sativa", label: "Sativa" },
  { slug: "indica", label: "Indica" },
  { slug: "hybrid", label: "Hybrid" },
];

interface ShopStrainFiltersProps {
  activeStrain: string;
  onSelectStrain: (strain: string) => void;
}

export function ShopStrainFilters({
  activeStrain,
  onSelectStrain,
}: ShopStrainFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filter by cannabis strain type"
      className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1"
    >
      {STRAIN_OPTIONS.map((item) => {
        const isActive = activeStrain === item.slug;
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onSelectStrain(item.slug)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all flex-shrink-0 cursor-pointer ${
              isActive
                ? "bg-neutral-900 text-white shadow-xs"
                : "bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
