"use client";

import * as React from "react";
import Link from "next/link";

export function StoreOrderCta() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 max-w-xl mx-auto">
        {/* Order Delivery Button */}
        <Link
          href="/shop?mode=delivery"
          className="flex-1 text-center bg-[#557754] hover:bg-[#496848] active:bg-[#3f5a3e] text-white font-extrabold text-sm sm:text-base tracking-wide py-3.5 sm:py-4 px-6 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 uppercase"
        >
          ORDER DELIVERY
        </Link>

        {/* Order Pickup Button */}
        <Link
          href="/shop?mode=pickup"
          className="flex-1 text-center bg-[#151515] hover:bg-[#252525] active:bg-black text-white font-extrabold text-sm sm:text-base tracking-wide py-3.5 sm:py-4 px-6 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 uppercase"
        >
          ORDER PICKUP
        </Link>
      </div>
    </div>
  );
}
