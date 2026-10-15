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
  FlowerTier,
} from "@/lib/deals";

interface FlowerBase {
  name: string;
  slug: string;
  type: string;
  image: string;
}

const TIER_BASE_FLOWERS: Record<FlowerTier, FlowerBase[]> = {
  Midshelf: [
    {
      name: "Tangie (Sativa)",
      slug: "tangie-sativa",
      type: "Sativa",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Acapulco Gold (Sativa)",
      slug: "acapulco-gold-sativa",
      type: "Sativa",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Death Star (Indica)",
      slug: "death-star-indica",
      type: "Indica",
      image: "/assets/img/flower.webp",
    },
  ],
  Topshelf: [
    {
      name: "Super Silver Haze (Sativa)",
      slug: "super-silver-haze-sativa",
      type: "Sativa",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Sour Diesel (Sativa)",
      slug: "sour-diesel-sativa",
      type: "Sativa",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Gorilla Glue (Hybrid)",
      slug: "gorilla-glue-hybrid",
      type: "Hybrid",
      image: "/assets/img/flower.webp",
    },
  ],
  "Private Reserve": [
    {
      name: "Rainbow Belts (Hybrid)",
      slug: "rainbow-belts-hybrid",
      type: "Hybrid",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Cereal Milk (Hybrid)",
      slug: "cereal-milk-hybrid",
      type: "Hybrid",
      image: "/assets/img/flower.webp",
    },
    {
      name: "Ice Cream Cake (Indica)",
      slug: "ice-cream-cake-indica",
      type: "Indica",
      image: "/assets/img/flower.webp",
    },
  ],
};

const TIER_PRICES: Record<FlowerTier, { h: number; o: number }> = {
  Midshelf: { h: 70, o: 100 },
  Topshelf: { h: 100, o: 140 },
  "Private Reserve": { h: 140, o: 220 },
};

const ADDONS = [
  {
    id: "top-shelf-1g-pre-rolls",
    name: "Top Shelf 1G Pre-Rolls",
    slug: "top-shelf-1g-pre-rolls",
    price: 10,
    weight: "1g",
    image: "/assets/img/preroll.webp",
    category: "pre-rolls",
  },
  {
    id: "exotic-1g-pre-rolls",
    name: "Exotic 1G Pre-Rolls",
    slug: "exotic-1g-pre-rolls",
    price: 15,
    weight: "1g",
    image: "/assets/img/preroll.webp",
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
  const unit = unitOf(lastAddedItem.weight);

  const isFlower =
    lastAddedItem.category === "flowers" ||
    Boolean(rawTier) ||
    (lastAddedItem as any).flowerTier !== undefined ||
    /(\bflower|\bsativa|\bindica|\bhybrid|\bmidshelf|\btopshelf|\bprivate reserve|\bexotic)/i.test(
      lastAddedItem.name
    );

  let effectiveTier: FlowerTier | null = normalizeTier(rawTier);
  if (!effectiveTier && isFlower) {
    const lower = lastAddedItem.name.toLowerCase();
    if (lower.includes("midshelf")) effectiveTier = "Midshelf";
    else if (lower.includes("private") || lower.includes("exotic")) effectiveTier = "Private Reserve";
    else effectiveTier = "Topshelf";
  }

  // Determine active deal type (ounces vs half-ounces)
  const isOzDeal = unit === "o";
  const targetUnit = isOzDeal ? "o" : "h";
  const targetWeight = isOzDeal ? "1 oz" : "14g";
  const targetWeightLabel = isOzDeal ? "1 oz" : "½ oz";

  // Compute live count of strains in cart for effective tier
  let halfCount = 0;
  let ozCount = 0;
  if (effectiveTier) {
    items.forEach((item) => {
      const itemTier = normalizeTier(item.tier || (item as any).flowerTier);
      if (itemTier === effectiveTier) {
        const u = unitOf(item.weight);
        if (u === "h") halfCount += item.quantity;
        if (u === "o") ozCount += item.quantity;
      }
    });
  }

  const activeCount = isOzDeal ? ozCount : halfCount;
  const pickPrice = effectiveTier ? TIER_PRICES[effectiveTier][targetUnit] : (isOzDeal ? 140 : 70);

  // Available strain picks for this tier (exclude current product)
  const currentFirstWord = lastAddedItem.name.toLowerCase().split(/[\s(]+/)[0] || "";
  const availablePicks = effectiveTier
    ? TIER_BASE_FLOWERS[effectiveTier].filter(
        (p) => !p.name.toLowerCase().startsWith(currentFirstWord)
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

        {/* ================= FLOWER DEAL BOX (LIVE INTERACTIVE PROGRESS) ================= */}
        {effectiveTier && isFlower && (
          <div className="dealbox">
            <div className="dealbox__top">
              <span className="dealbox__tag">
                {isOzDeal
                  ? ozCount >= 8
                    ? "HALF-POUND HAUL"
                    : "STACK & SAVE"
                  : "DOUBLE UP"}
              </span>
              <span className="muted">
                {isOzDeal
                  ? `${effectiveTier} · ${Math.min(ozCount, 8)} oz`
                  : `${effectiveTier} · ${Math.min(halfCount, 4)} of 4 half oz`}
              </span>
            </div>

            <strong>
              {isOzDeal
                ? nextStepOz(effectiveTier, ozCount)?.title ||
                  `Mix any ${effectiveTier} strains by the ounce.`
                : nextStep(effectiveTier, halfCount)?.title ||
                  `Best deal unlocked: 4 half ounces for $${
                    effectiveTier === "Midshelf"
                      ? 250
                      : effectiveTier === "Topshelf"
                      ? 340
                      : 480
                  }`}
            </strong>

            <span className="muted">
              {isOzDeal
                ? `Mix any ${effectiveTier} strains by the ounce.`
                : `Mix any ${effectiveTier} strains by the half ounce.`}
            </span>

            {/* Live Progress Meter Bar */}
            <div className="meter">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    (isOzDeal ? Math.min(ozCount, 4) : Math.min(halfCount, 4)) * 25
                  )}%`,
                }}
              />
            </div>

            {/* Recommended Strain Picks with Live + Add */}
            {availablePicks.slice(0, 3).map((base) => {
              const pickId = `${base.slug}-${targetWeight.replace(/\s+/g, "")}`;
              const baseKeyword = base.name.toLowerCase().split(/[\s(]+/)[0];

              const inCart = items.some(
                (i) =>
                  (i.id === pickId ||
                    i.slug === base.slug ||
                    i.name.toLowerCase().includes(baseKeyword)) &&
                  unitOf(i.weight) === targetUnit
              );

              return (
                <div key={base.slug} className="pickrow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={base.image}
                    alt={base.name}
                    width={42}
                    height={42}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/img/flower.webp";
                    }}
                  />
                  <span>
                    <strong>{base.name}</strong>
                    <span>
                      {base.type} · {targetWeightLabel} · ${pickPrice}
                    </span>
                  </span>
                  <button
                    type="button"
                    className={`smallpill ${inCart ? "is-on" : ""}`}
                    onClick={() => {
                      if (inCart) {
                        const match = items.find(
                          (i) =>
                            (i.id === pickId ||
                              i.slug === base.slug ||
                              i.name.toLowerCase().includes(baseKeyword)) &&
                            unitOf(i.weight) === targetUnit
                        );
                        if (match) {
                          removeItem(match.id, match.weight);
                        }
                      } else {
                        addItem(
                          {
                            id: pickId,
                            name: base.name,
                            slug: base.slug,
                            price: pickPrice,
                            weight: targetWeight,
                            tier: effectiveTier,
                            category: "flowers",
                            image: base.image,
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

        {/* ================= GOES GREAT WITH (ADD-ONS) ================= */}
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

        {/* ================= BOTTOM ACTION BUTTONS ================= */}
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
