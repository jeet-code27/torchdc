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

  // Flowers by tier, exactly like the client site (p.cat === "flowers" && p.tier === tier)
  const flowerProducts = React.useMemo(
    () => initialProducts.filter((p) => (p.category || "").toLowerCase() === "flowers"),
    [initialProducts]
  );
  const midshelfStrains = React.useMemo(
    () => flowerProducts.filter((p) => p.tier === "midshelf"),
    [flowerProducts]
  );
  const topshelfStrains = React.useMemo(
    () => flowerProducts.filter((p) => p.tier === "topshelf"),
    [flowerProducts]
  );
  const privateReserveStrains = React.useMemo(
    () => flowerProducts.filter((p) => p.tier === "exotic"),
    [flowerProducts]
  );

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
    return currentTierList.filter((p) => (p.strain || "").toLowerCase() === selectedType.toLowerCase());
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
    <>
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
            <img src="/assets/img/flower.webp" alt="" />
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
          <div className="chips rail-x" aria-label="Strain type">
            {(["All", "Sativa", "Indica", "Hybrid"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`chip ${selectedType === type ? "is-on" : ""}`}
                aria-pressed={selectedType === type}
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
                <Link key={p.id} className="strain" href={`/product/${p.slug}`}>
                  <span className="strain__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image || "/assets/img/flower.webp"}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span className="strain__t">
                    <strong>{p.name}</strong>
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
              <div className="empty">
                <strong>No {selectedType.toLowerCase()} strains in this tier right now</strong>
              </div>
            )}
          </div>
        </main>

        {/* Right Sticky Cart Sidebar */}
        <ShopCartSidebar />
      </div>

      <ShopStickyCartBar />
    </>
  );
}
