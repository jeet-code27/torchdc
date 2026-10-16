"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";

export interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  category?: string;
  tier?: "midshelf" | "topshelf" | "exotic" | string;
  strain?: "sativa" | "indica" | "hybrid" | string;
  weight?: string;
  subtitle?: string;
  hasOptions?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  badge?: string;
  inStock?: boolean;
}

interface ShopProductCardProps {
  product: ShopProduct;
  layout?: "grid" | "list";
}

export function ShopProductCard({
  product,
  layout = "grid",
}: ShopProductCardProps) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((i) => i.id === product.id || i.slug === product.slug);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image || "/assets/img/flower.webp",
      weight: product.weight || "3.5g",
      tier: product.tier,
      category: product.category,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  // Determine badge
  let badgeEl: React.ReactNode = null;
  const bLow = (product.badge || "").toLowerCase();
  if (
    bLow === "hot" ||
    bLow === "best seller" ||
    bLow === "best sellers" ||
    (!product.badge && product.isBestSeller)
  ) {
    badgeEl = (
      <span className="pcard__flame" aria-label="Best seller">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 1.5c1.2 3.6 5.5 5.6 5.5 11.2A5.5 5.5 0 0 1 6.5 13c0-2.6 1.2-4.4 2.8-5.6.2 2.2 1.2 3.4 2.6 3.4.1-3.6-1.4-6.2.1-9.3z"
            fill="#FF7A1F"
          />
          <path
            d="M12 22a3 3 0 0 1-3-3c0-1.6 1-2.6 2-3.4.2 1 .8 1.6 1.6 1.6 0-1 .1-1.8.7-2.6C14.2 15.6 15 17 15 19a3 3 0 0 1-3 3z"
            fill="#FFC23D"
          />
        </svg>
      </span>
    );
  } else if (bLow === "new" || (!product.badge && product.isNewArrival)) {
    badgeEl = <span className="pcard__new">NEW</span>;
  } else if (product.badge) {
    badgeEl = <span className="pcard__new pcard__new--dark">{product.badge}</span>;
  }

  // Display subtitle or strain
  // A built subtitle (even an empty one) wins, matching the client card meta
  const metaText =
    product.subtitle ??
    ([product.strain ? capitalize(product.strain) : "", product.tier ? capitalize(product.tier) : "", product.weight]
      .filter(Boolean)
      .join(" · ") ||
      "Washington, DC Local");

  if (layout === "list") {
    return (
      <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-all group">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center gap-3.5 flex-1 min-w-0"
        >
          <div className="relative w-16 h-16 rounded-xl bg-[#F6F8F6] p-2 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || "/assets/img/flower.webp"}
              alt={product.name}
              className="w-12 h-12 object-contain mix-blend-multiply transition-transform group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-[15px] text-neutral-900 truncate">
              {product.name}
            </h4>
            <span className="text-xs text-neutral-500 block truncate mt-0.5">
              {metaText}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3 pl-3">
          <div className="text-right">
            <span className="block text-[11px] text-neutral-400">from</span>
            <span className="text-[16px] font-extrabold text-neutral-900">
              ${product.price}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 ${
              cartQty > 0 || justAdded
                ? "bg-[#5A805B] text-white"
                : "bg-white text-neutral-900 border border-neutral-200 hover:bg-[#5A805B] hover:text-white"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded || cartQty > 0 ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    );
  }

  const isIn = justAdded || cartQty > 0;

  return (
    <div className="pcard">
      <div className="pcard__img">
        <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || "/assets/img/flower.webp"}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        {badgeEl}
        <button
          className={`add ${isIn ? "is-in" : ""}`}
          type="button"
          onClick={handleAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : cartQty > 0 ? (
            cartQty
          ) : (
            "+"
          )}
        </button>
      </div>
      <Link className="pcard__name" href={`/product/${product.slug}`}>
        {product.name}
      </Link>
      <span className="pcard__meta">{metaText}</span>
      <span className="pcard__price">{product.hasOptions ? "from " : ""}${product.price}</span>
    </div>
  );
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
