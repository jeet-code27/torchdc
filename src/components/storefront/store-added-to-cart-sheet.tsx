"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, CartItem } from "@/context/cart-context";
import {
  unitOf,
  nextStep,
  nextStepOz,
  normalizeTier,
  WEIGHTS,
  FlowerTier,
} from "@/lib/deals";

interface FlowerPick {
  id: string;
  name: string;
  slug: string;
  tier: FlowerTier;
  type: string;
  weight: string;
  price: number;
  image: string;
}

const TIER_FLOWERS: Record<FlowerTier, FlowerPick[]> = {
  Midshelf: [
    {
      id: "tangie-sativa-14g",
      name: "Tangie (Sativa)",
      slug: "tangie-sativa",
      tier: "Midshelf",
      type: "Sativa",
      weight: "14g",
      price: 70,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Tangie-strain-Sativa.png",
    },
    {
      id: "acapulco-gold-sativa-14g",
      name: "Acapulco Gold (Sativa)",
      slug: "acapulco-gold-sativa",
      tier: "Midshelf",
      type: "Sativa",
      weight: "14g",
      price: 70,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Acapulco-Gold-Sativa.png",
    },
    {
      id: "death-star-indica-14g",
      name: "Death Star (Indica)",
      slug: "death-star-indica",
      tier: "Midshelf",
      type: "Indica",
      weight: "14g",
      price: 70,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Death-Star-Indica.png",
    },
  ],
  Topshelf: [
    {
      id: "super-silver-haze-sativa-14g",
      name: "Super Silver Haze (Sativa)",
      slug: "super-silver-haze-sativa",
      tier: "Topshelf",
      type: "Sativa",
      weight: "14g",
      price: 100,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Super-Silver-Haze-Sativa.png",
    },
    {
      id: "sour-diesel-sativa-14g",
      name: "Sour Diesel (Sativa)",
      slug: "sour-diesel-sativa",
      tier: "Topshelf",
      type: "Sativa",
      weight: "14g",
      price: 100,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Sour-Diesel-Sativa.png",
    },
    {
      id: "gorilla-glue-hybrid-14g",
      name: "Gorilla Glue (Hybrid)",
      slug: "gorilla-glue-hybrid",
      tier: "Topshelf",
      type: "Hybrid",
      weight: "14g",
      price: 100,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Gorilla-Glue-Hybrid.png",
    },
  ],
  "Private Reserve": [
    {
      id: "rainbow-belts-hybrid-14g",
      name: "Rainbow Belts (Hybrid)",
      slug: "rainbow-belts-hybrid",
      tier: "Private Reserve",
      type: "Hybrid",
      weight: "14g",
      price: 140,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Rainbow-Belts-Hybrid.png",
    },
    {
      id: "cereal-milk-hybrid-14g",
      name: "Cereal Milk (Hybrid)",
      slug: "cereal-milk-hybrid",
      tier: "Private Reserve",
      type: "Hybrid",
      weight: "14g",
      price: 140,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Cereal-Milk-Hybrid.png",
    },
    {
      id: "ice-cream-cake-indica-14g",
      name: "Ice Cream Cake (Indica)",
      slug: "ice-cream-cake-indica",
      tier: "Private Reserve",
      type: "Indica",
      weight: "14g",
      price: 140,
      image: "https://torchdc.co/wp-content/uploads/2025/09/Ice-Cream-Cake-Indica.png",
    },
  ],
};

const ADDONS = [
  {
    id: "top-shelf-1g-pre-rolls",
    name: "Top Shelf 1G Pre-Rolls",
    slug: "top-shelf-1g-pre-rolls",
    price: 10,
    weight: "1g",
    image: "https://i0.wp.com/torchdc.co/wp-content/uploads/2025/11/new-torch-pre-rolls.jpg?fit=2082%2C1249&ssl=1",
    category: "pre-rolls",
  },
  {
    id: "exotic-1g-pre-rolls",
    name: "Exotic 1G Pre-Rolls",
    slug: "exotic-1g-pre-rolls",
    price: 15,
    weight: "1g",
    image: "https://i0.wp.com/torchdc.co/wp-content/uploads/2025/11/new-torch-pre-rolls.jpg?fit=2082%2C1249&ssl=1",
    category: "pre-rolls",
  },
];

export function StoreAddedToCartSheet() {
  const {
    items,
    isAddedSheetOpen,
    setIsAddedSheetOpen,
    lastAddedItem,
    addItem,
    removeItem,
    finalTotal,
  } = useCart();

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isAddedSheetOpen) {
        setIsAddedSheetOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddedSheetOpen, setIsAddedSheetOpen]);

  if (!isAddedSheetOpen || !lastAddedItem) {
    return null;
  }

  const rawTier = lastAddedItem.tier || (lastAddedItem as any).flowerTier;
  const tier = normalizeTier(rawTier);
  const unit = unitOf(lastAddedItem.weight);

  // Compute flower counts for the active tier
  let halfCount = 0;
  let ozCount = 0;
  if (tier) {
    items.forEach((item) => {
      const itemTier = normalizeTier(item.tier || (item as any).flowerTier);
      if (itemTier === tier) {
        const u = unitOf(item.weight);
        if (u === "h") halfCount += item.quantity;
        if (u === "o") ozCount += item.quantity;
      }
    });
  }

  // Pick rows for half ounce
  const availablePicks = tier
    ? TIER_FLOWERS[tier].filter(
        (p) =>
          !lastAddedItem.name.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
      )
    : [];

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Added to cart">
      {/* Dimmed backdrop */}
      <div
        className="sheet__bg"
        onClick={() => setIsAddedSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Sheet card modal */}
      <div className="sheet__card">
        {/* Grip handle */}
        <div className="sheet__grip" />

        {/* Confirmation row */}
        <div className="sheet__ok">
          <span className="okdot">✓</span>
          <span>
            <strong>Added to cart</strong>
            <span>
              {lastAddedItem.name}
              {lastAddedItem.weight ? ` · ${lastAddedItem.weight}` : ""}
              {lastAddedItem.quantity > 1 ? ` x ${lastAddedItem.quantity}` : ""}
            </span>
          </span>
        </div>

        {/* DOUBLE UP Deal Box for Half Ounces */}
        {tier && unit === "h" && (
          <div className="dealbox">
            <span className="dealbox__tag">DOUBLE UP</span>
            <strong>
              {nextStep(tier, halfCount)?.title ||
                `Best deal unlocked: 4 half ounces for $${
                  tier === "Midshelf" ? 250 : tier === "Topshelf" ? 340 : 480
                }`}
            </strong>
            <span className="muted">
              Mix any {tier} strains by the half ounce.
            </span>

            {/* Progress meter */}
            <div className="meter">
              <span style={{ width: `${Math.min(halfCount, 4) * 25}%` }} />
            </div>

            {/* Recommended strain picks */}
            {availablePicks.slice(0, 3).map((pick) => {
              const inCart = items.some(
                (i) => i.id === pick.id || (i.name === pick.name && i.weight === pick.weight)
              );

              return (
                <div key={pick.id} className="pickrow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pick.image}
                    alt={pick.name}
                    width={42}
                    height={42}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/img/logo.webp";
                    }}
                  />
                  <span>
                    <strong>{pick.name}</strong>
                    <span>
                      {pick.type} · ½ oz · ${pick.price}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={`smallpill ${inCart ? "is-on" : ""}`}
                    onClick={() => {
                      if (inCart) {
                        removeItem(pick.id, pick.weight);
                      } else {
                        addItem(
                          {
                            id: pick.id,
                            name: pick.name,
                            slug: pick.slug,
                            price: pick.price,
                            weight: pick.weight,
                            tier: pick.tier,
                            category: "flowers",
                            image: pick.image,
                          },
                          1,
                          { showSheet: false }
                        );
                      }
                    }}
                  >
                    {inCart ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* STACK & SAVE / HALF-POUND HAUL Deal Box for Ounces */}
        {tier && unit === "o" && (
          <div className="dealbox">
            <span className="dealbox__tag">
              {ozCount >= 8 ? "HALF-POUND HAUL" : "STACK & SAVE"}
            </span>
            <strong>
              {nextStepOz(tier, ozCount)?.title ||
                `Mix any ${tier} strains by the ounce.`}
            </strong>
            <span className="muted">Mix any {tier} strains by the ounce.</span>
            <div className="meter">
              <span style={{ width: `${Math.min(ozCount, 4) * 25}%` }} />
            </div>
          </div>
        )}

        {/* Goes great with section */}
        <span className="lbl">Goes great with</span>
        <div className="addons">
          {ADDONS.map((addon) => {
            const inCart = items.some((i) => i.id === addon.id);

            return (
              <div key={addon.id} className="addon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={addon.image} alt={addon.name} width={68} height={68} />
                <span>{addon.name}</span>
                <span className="addon__row">
                  <b>${addon.price}</b>
                  <button
                    type="button"
                    className={`addsm ${inCart ? "is-on" : ""}`}
                    onClick={() => {
                      if (inCart) {
                        removeItem(addon.id, addon.weight);
                      } else {
                        addItem(
                          {
                            id: addon.id,
                            name: addon.name,
                            slug: addon.slug,
                            price: addon.price,
                            weight: addon.weight,
                            image: addon.image,
                            category: addon.category,
                          },
                          1,
                          { showSheet: false }
                        );
                      }
                    }}
                    aria-label={`Toggle ${addon.name}`}
                  >
                    {inCart ? "✓" : "+"}
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="sheet__btns">
          <button
            type="button"
            className="ghostbtn"
            onClick={() => setIsAddedSheetOpen(false)}
          >
            Keep shopping
          </button>
          <Link
            href="/cart"
            className="checkoutbtn"
            onClick={() => setIsAddedSheetOpen(false)}
          >
            View cart · ${finalTotal}
          </Link>
        </div>
      </div>
    </div>
  );
}
