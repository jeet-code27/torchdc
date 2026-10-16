"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Sparkles } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { ShopProduct } from "./shop-product-card";

interface CartAddToOrderProps {
  title?: string;
  className?: string;
  compact?: boolean;
}

export function CartAddToOrder({
  title = "Add to your order",
  className = "",
  compact = false,
}: CartAddToOrderProps) {
  const { items, addItem } = useCart();
  const [suggestions, setSuggestions] = React.useState<ShopProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let isMounted = true;
    async function loadAddOns() {
      try {
        // Same rule as the client site: single-option items at $60 or less, in menu order
        const res = await fetch("/api/products?limit=100");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && isMounted) {
          // Normalize to ShopProduct format
          const formatted: ShopProduct[] = data.products
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => (p.variants?.length || 0) <= 1)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => {
            const resolvedImg =
              p.images?.find((img: any) => img?.isPrimary && img?.url)?.url ||
              p.images?.find((img: any) => typeof img?.url === "string" && img.url)?.url ||
              (typeof p.images?.[0] === "string" ? p.images[0] : p.images?.[0]?.url) ||
              (typeof p.image === "string" ? p.image : null) ||
              "/images/placeholder-product.png";

            return {
              id: p._id || p.id,
              name: p.name,
              slug: p.slug,
              // The price checkout charges (variant or product price, not the sale price)
              price: p.variants?.[0]?.price ?? p.price ?? 0,
              image: resolvedImg,
              weight: p.variants?.[0]?.name || "",
            };
          })
            .filter((p: ShopProduct) => p.price > 0 && p.price <= 60);
          setSuggestions(formatted);
        }
      } catch (err) {
        console.error("Failed to load add-on suggestions:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAddOns();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter out products already in cart
  const cartItemIds = React.useMemo(() => {
    return new Set(items.map((i) => i.id));
  }, [items]);

  const availableSuggestions = React.useMemo(() => {
    return suggestions.filter((p) => !cartItemIds.has(p.id)).slice(0, compact ? 4 : 6);
  }, [suggestions, cartItemIds, compact]);

  if (loading && suggestions.length === 0) {
    return null;
  }

  if (availableSuggestions.length === 0) {
    return null;
  }

  const handleAdd = (prod: ShopProduct) => {
    addItem({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      slug: prod.slug,
      weight: prod.weight || "1g",
      category: prod.category,
    });

    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 1000);
  };

  return (
    <div className={className}>
      <span className="lbl">{title}</span>
      <div className="addons addons--4">
        {availableSuggestions.map((prod) => {
          const isJustAdded = Boolean(addedIds[prod.id]);

          return (
            <div key={prod.id} className="addon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prod.image || "/assets/img/logo.webp"}
                alt={prod.name}
              />
              <span>{prod.name}</span>
              <span className="addon__row">
                <b>${prod.price}</b>
                <button
                  type="button"
                  className={`addsm ${isJustAdded ? "is-on" : ""}`}
                  onClick={() => handleAdd(prod)}
                  aria-label={`Add ${prod.name}`}
                >
                  {isJustAdded ? "✓" : "+"}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
