"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

export function ShopStickyCartBar() {
  const { totalCount, finalTotal } = useCart();
  const pathname = usePathname();

  // Hide on cart/checkout page or if empty
  if (totalCount === 0 || pathname === "/cart" || pathname === "/checkout") return null;

  return (
    <div className="cartbar is-on">
      <Link href="/cart" style={{ color: "#FFFFFF" }}>
        <span className="cartbar__l" style={{ color: "#FFFFFF" }}>
          <strong style={{ color: "#FFFFFF" }}>View cart</strong>
          <span style={{ color: "rgba(255,255,255,0.92)" }}>
            {totalCount} {totalCount === 1 ? "item" : "items"} · free delivery
          </span>
        </span>

        <span className="cartbar__total" style={{ background: "#FFFFFF", color: "#2F4F30" }}>
          ${finalTotal.toLocaleString("en-US")}
        </span>
      </Link>
    </div>
  );
}
