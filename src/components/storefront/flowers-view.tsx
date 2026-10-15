"use client";

import * as React from "react";
import Link from "next/link";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { ShopProduct } from "./shop-product-card";

interface FlowersViewProps {
  initialProducts: ShopProduct[];
  initialTier?: string;
}

export function FlowersView({
  initialProducts,
  initialTier = "Topshelf",
}: FlowersViewProps) {
  const [selectedTier, setSelectedTier] = React.useState<
    "Midshelf" | "Topshelf" | "Private Reserve"
  >(
    initialTier === "Midshelf" || initialTier === "Private Reserve"
      ? initialTier
      : "Topshelf"
  );
  const [selectedType, setSelectedType] = React.useState<
    "All" | "Sativa" | "Indica" | "Hybrid"
  >("All");

  // Filter only flower products
  const flowerProducts = React.useMemo(() => {
    return initialProducts.filter((p) => {
      const cat = (p.category || "").toLowerCase();
      return (
        cat === "flowers" ||
        cat === "flower" ||
        (!cat && !p.name.toLowerCase().includes("gummy") && !p.name.toLowerCase().includes("mushroom"))
      );
    });
  }, [initialProducts]);

  // Map tier to products
  const midshelfStrains = React.useMemo(() => {
    return flowerProducts.filter((p) => {
      const t = (p.tier || "").toLowerCase();
      const n = p.name.toLowerCase();
      return (
        t === "midshelf" ||
        n.includes("midshelf") ||
        (!p.tier && p.price > 0 && p.price < 35)
      );
    });
  }, [flowerProducts]);

  const topshelfStrains = React.useMemo(() => {
    return flowerProducts.filter((p) => {
      const t = (p.tier || "").toLowerCase();
      const n = p.name.toLowerCase();
      return (
        t === "topshelf" ||
        n.includes("topshelf") ||
        (!p.tier && (p.price >= 35 && p.price < 55 || p.price === 0))
      );
    });
  }, [flowerProducts]);

  const privateReserveStrains = React.useMemo(() => {
    return flowerProducts.filter((p) => {
      const t = (p.tier || "").toLowerCase();
      const n = p.name.toLowerCase();
      return (
        t === "exotic" ||
        t === "private-reserve" ||
        t === "private reserve" ||
        n.includes("private reserve") ||
        n.includes("exotic") ||
        (!p.tier && p.price >= 55)
      );
    });
  }, [flowerProducts]);

  // Current active tier list
  const currentTierList = React.useMemo(() => {
    switch (selectedTier) {
      case "Midshelf":
        return midshelfStrains;
      case "Private Reserve":
        return privateReserveStrains;
      case "Topshelf":
      default:
        return topshelfStrains;
    }
  }, [selectedTier, midshelfStrains, topshelfStrains, privateReserveStrains]);

  // Filter by strain type
  const displayedStrains = React.useMemo(() => {
    if (selectedType === "All") return currentTierList;
    return currentTierList.filter((p) => {
      const st = (p.strain || "").toLowerCase();
      const n = p.name.toLowerCase();
      const target = selectedType.toLowerCase();
      return st === target || n.includes(`(${target}`) || n.includes(` ${target}`);
    });
  }, [currentTierList, selectedType]);

  const strainColorClass = (strain?: string, name?: string) => {
    const s = (strain || "").toLowerCase();
    const n = (name || "").toLowerCase();
    if (s === "sativa" || n.includes("sativa")) return "type--sativa";
    if (s === "indica" || n.includes("indica")) return "type--indica";
    return "type--hybrid";
  };

  const strainTypeLabel = (strain?: string, name?: string) => {
    const s = (strain || "").toUpperCase();
    const n = (name || "").toUpperCase();
    if (s === "SATIVA" || n.includes("SATIVA")) return "SATIVA";
    if (s === "INDICA" || n.includes("INDICA")) return "INDICA";
    return "HYBRID";
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen">
      <div className="shell">
        {/* Left Sidebar Menu */}
        <ShopSidebar activeCategory="flowers" />

        {/* Main Center Content */}
        <main className="shell__main">
          {/* Flower Hero Banner */}
          <section className="phero">
            <div>
              <span className="eyebrow">HAND-PICKED · SAME-DAY DELIVERY</span>
              <h1>Flowers</h1>
              <span className="muted">Three tiers, one standard of quality.</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/flower.webp" alt="Torch Cannabis Flowers" />
          </section>

          {/* 3 Tier Buttons */}
          <div className="tiers" role="tablist" aria-label="Select flower tier">
            <button
              type="button"
              role="tab"
              aria-selected={selectedTier === "Midshelf"}
              className={`tier ${selectedTier === "Midshelf" ? "is-on" : ""}`}
              onClick={() => {
                setSelectedTier("Midshelf");
                setSelectedType("All");
              }}
            >
              <span className="tier__l">
                <span className="tier__n">Midshelf</span>
                <span className="tier__d">Quality picks, priced for value</span>
              </span>
              <span className="tier__c">
                {midshelfStrains.length} {midshelfStrains.length === 1 ? "strain" : "strains"}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedTier === "Topshelf"}
              className={`tier ${selectedTier === "Topshelf" ? "is-on" : ""}`}
              onClick={() => {
                setSelectedTier("Topshelf");
                setSelectedType("All");
              }}
            >
              <span className="tier__l">
                <span className="tier__n">Topshelf</span>
                <span className="tier__d">Our core lineup of classics</span>
              </span>
              <span className="tier__c">
                {topshelfStrains.length} {topshelfStrains.length === 1 ? "strain" : "strains"}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedTier === "Private Reserve"}
              className={`tier ${selectedTier === "Private Reserve" ? "is-on" : ""}`}
              onClick={() => {
                setSelectedTier("Private Reserve");
                setSelectedType("All");
              }}
            >
              <span className="tier__l">
                <span className="tier__n">Private Reserve</span>
                <span className="tier__d">Small-batch exotics</span>
              </span>
              <span className="tier__c">
                {privateReserveStrains.length} {privateReserveStrains.length === 1 ? "strain" : "strains"}
              </span>
            </button>
          </div>

          {/* Strain Filter Chips */}
          <div
            className="chips rail-x"
            aria-label="Strain type"
            style={{ padding: "14px 16px 0", display: "flex", gap: "8px", overflowX: "auto" }}
          >
            {(["All", "Sativa", "Indica", "Hybrid"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`chip ${selectedType === type ? "is-on" : ""}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Strain Count Header */}
          <span className="muted listcount">
            {displayedStrains.length} {selectedTier} strains
          </span>

          {/* Strains List (2 columns on desktop) */}
          <div className="strains" aria-live="polite">
            {displayedStrains.length > 0 ? (
              displayedStrains.map((p) => (
                <Link
                  key={p.id}
                  className="strain group hover:bg-[#F0F5F0] transition-colors rounded-xl px-2.5 -mx-2.5"
                  href={`/product/${p.slug}`}
                >
                  <span className="strain__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || "/assets/img/flower.webp"}
                      alt={p.name}
                      loading="lazy"
                    />
                  </span>
                  <span className="strain__t">
                    <strong className="group-hover:text-[#5A805B] transition-colors">
                      {p.name}
                    </strong>
                    <span
                      className={`type ${strainColorClass(p.strain, p.name)}`}
                    >
                      {strainTypeLabel(p.strain, p.name)}
                    </span>
                  </span>
                  <span className="strain__p">
                    <span>from</span>
                    <strong>${p.price}</strong>
                  </span>
                </Link>
              ))
            ) : (
              <div className="empty py-12 text-center col-span-2">
                <strong className="text-neutral-900 block text-lg font-bold">
                  No {selectedType.toLowerCase()} strains in this tier right now
                </strong>
                <span className="text-sm text-neutral-500 mt-1 block">
                  Try switching strain type or select another tier above.
                </span>
              </div>
            )}
          </div>
        </main>

        {/* Right Sticky Cart Sidebar */}
        <ShopCartSidebar />
      </div>

      <ShopStickyCartBar />
    </div>
  );
}
