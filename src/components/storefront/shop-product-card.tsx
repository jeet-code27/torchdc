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
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      weight: product.weight || "3.5g",
      tier: product.tier,
      category: product.category,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  // Determine badge
  let badgeContent: React.ReactNode = null;
  if (product.badge) {
    badgeContent = (
      <span className="inline-block bg-[#E8561E] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
        {product.badge}
      </span>
    );
  } else if (product.isBestSeller) {
    badgeContent = (
      <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 text-[11px] font-black px-2 py-0.5 rounded-full">
        🔥 <span className="hidden sm:inline">BEST SELLER</span>
      </span>
    );
  } else if (product.isNewArrival) {
    badgeContent = (
      <span className="inline-block bg-[#E8561E] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
        NEW
      </span>
    );
  } else if (product.tier === "exotic") {
    badgeContent = (
      <span className="inline-block bg-[#2F4F30] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
        EXOTIC
      </span>
    );
  }

  // Display subtitle or strain
  const metaText =
    product.subtitle ||
    [product.tier ? capitalize(product.tier) : "", product.strain ? capitalize(product.strain) : "", product.weight]
      .filter(Boolean)
      .join(" · ") ||
    "Washington, DC Local";

  if (layout === "list") {
    return (
      <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-all group">
        <Link
          href={`/product/${product.slug}`}
          className="flex items-center gap-3.5 flex-1 min-w-0"
        >
          <div className="relative w-16 h-16 rounded-xl bg-white border border-neutral-100/90 p-2 flex-shrink-0 overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain mix-blend-multiply transition-transform group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-[15px] text-neutral-900 truncate">
              {product.name}
            </h4>
            {product.strain && (
              <span className="inline-block bg-[#eef5ee] text-[#2F4F30] text-[11px] font-bold px-2 py-0.5 rounded-md mt-1">
                {capitalize(product.strain)}
              </span>
            )}
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
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              justAdded
                ? "bg-[#5A805B] text-white"
                : "border border-neutral-300 text-neutral-700 hover:bg-[#5A805B] hover:text-white hover:border-[#5A805B]"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="flex flex-col h-full bg-white rounded-2xl p-3 sm:p-3.5 border border-neutral-200/70 hover:border-neutral-300/80 hover:shadow-xs transition-all group">
      {/* Product Image Box - Pure White with Multiply Blend Mode */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full rounded-xl bg-white border border-neutral-100/90 p-3 flex items-center justify-center overflow-hidden mb-2.5"
      >
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10">{badgeContent}</div>

        <div className="relative w-[82%] h-[82%] transition-transform duration-300 group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain mix-blend-multiply"
          />
        </div>
      </Link>

      {/* Title & Metadata */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-bold text-[14px] sm:text-[15px] text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#5A805B] transition-colors">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-[12px] text-neutral-500 line-clamp-1 mt-0.5 mb-2.5">
          {metaText}
        </p>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] text-neutral-400 block leading-none">
              from
            </span>
            <span className="text-[16px] sm:text-[17px] font-extrabold text-neutral-900 leading-tight">
              ${product.price}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              justAdded
                ? "bg-[#557754] text-white scale-110 shadow-xs"
                : "border border-neutral-300 text-neutral-800 hover:bg-[#557754] hover:text-white hover:border-[#557754] active:scale-95"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
