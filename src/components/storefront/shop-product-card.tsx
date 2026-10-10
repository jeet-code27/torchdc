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
      <span className="inline-block bg-[#E8561E] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
        BEST SELLER
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
              sizes="64px"
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
            className="w-9 h-9 rounded-full bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="flex flex-col h-full bg-transparent group">
      {/* Product Image Box - #F6F8F6 soft rounded background */}
      <div
        style={{ backgroundColor: "#F6F8F6" }}
        className="relative h-[132px] sm:h-[148px] w-full rounded-2xl p-2.5 sm:p-3 flex items-center justify-center overflow-hidden mb-2"
      >
        {/* Badges */}
        {badgeContent && (
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
            {badgeContent}
          </div>
        )}

        {/* Product Image Link */}
        <Link
          href={`/product/${product.slug}`}
          style={{ backgroundColor: "#F6F8F6" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <div
            style={{ backgroundColor: "#F6F8F6" }}
            className="relative w-[80%] h-[80%] transition-transform duration-300 group-hover:scale-105"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              className="object-contain mix-blend-multiply"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
        </Link>

        {/* Floating Circular Plus Button in Bottom Right of Image Box */}
        <button
          type="button"
          onClick={handleAdd}
          className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-neutral-900 hover:bg-[#5A805B] hover:text-white shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <Check className="w-3.5 h-3.5 stroke-[3] text-[#5A805B]" />
          ) : (
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Title & Metadata & Price below image container */}
      <div className="flex-1 flex flex-col pt-0.5">
        <h3 className="font-bold text-[13px] sm:text-[14px] text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#5A805B] transition-colors">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="text-[11px] sm:text-[12px] text-neutral-500 line-clamp-1 mt-0.5">
          {metaText}
        </p>

        {/* Plain bold price (Matching client screenshot) */}
        <div className="mt-1 text-[15px] sm:text-[16px] font-extrabold text-neutral-900 leading-tight">
          ${product.price}
        </div>
      </div>
    </article>
  );
}

function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
