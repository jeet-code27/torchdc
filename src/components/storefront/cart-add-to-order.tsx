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
        // Fetch popular pre-rolls and impulse add-ons
        const res = await fetch("/api/products?limit=16");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && isMounted) {
          // Normalize to ShopProduct format
          const formatted: ShopProduct[] = data.products.map((p: any) => {
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
              price: p.salePrice || p.price || 0,
              image: resolvedImg,
              category: "pre-rolls",
              weight: p.variants?.[0]?.weight || "1g",
            };
          });
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
    <div className={`space-y-3 ${className}`}>
      {/* Title matching client screenshot */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-[15px] sm:text-[17px] text-neutral-900 tracking-tight">
          {title}
        </h3>
      </div>

      {/* Cards list / scrollable row */}
      <div
        className={
          compact
            ? "flex gap-2.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5"
        }
      >
        {availableSuggestions.map((prod) => {
          const isJustAdded = Boolean(addedIds[prod.id]);

          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl border border-neutral-200/80 p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-xs hover:border-neutral-300 transition-all ${
                compact ? "w-[155px] sm:w-[170px] shrink-0" : "w-full"
              }`}
            >
              {/* Product Image */}
              <Link
                href={`/product/${prod.slug}`}
                className="relative aspect-square w-full rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden mb-2 group"
              >
                <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={prod.image || "/images/placeholder-product.png"}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 640px) 150px, 200px"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
              </Link>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-[13px] sm:text-[14px] text-neutral-900 line-clamp-2 leading-snug">
                  <Link
                    href={`/product/${prod.slug}`}
                    className="hover:text-[#5A805B] transition-colors"
                  >
                    {prod.name}
                  </Link>
                </h4>

                {/* Price & Solid Brand Green Plus Button */}
                <div className="flex items-center justify-between mt-2.5 pt-1 border-t border-neutral-100/70">
                  <span className="font-black text-[15px] sm:text-[16px] text-neutral-900 leading-none">
                    ${prod.price}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAdd(prod)}
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-[#5A805B] hover:bg-[#466645] text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                    aria-label={`Add ${prod.name} to order`}
                  >
                    {isJustAdded ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
