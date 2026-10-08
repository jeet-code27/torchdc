"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";

export function ShopStickyCartBar() {
  const { totalCount, subtotal } = useCart();

  if (totalCount === 0) return null;

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
      <Link
        href="/cart"
        className="flex items-center justify-between bg-[#557754] hover:bg-[#466645] active:scale-[0.99] text-white px-5 py-3.5 rounded-full shadow-xl shadow-[#557754]/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
            {totalCount}
          </div>
          <div className="text-left">
            <span className="block font-black text-[15px] leading-tight">
              View cart
            </span>
            <span className="block text-[11px] text-white/80 leading-tight">
              {totalCount} {totalCount === 1 ? "item" : "items"} · free DC delivery
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-[17px]">
            ${subtotal.toFixed(2)}
          </span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  );
}
