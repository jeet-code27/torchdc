"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { ShopProduct, ShopProductCard } from "./shop-product-card";

interface ContentPageViewProps {
  html: string;
  /** Products for the "Popular in [area]" rail */
  railProducts?: ShopProduct[];
}

/**
 * A content page from the client site (neighborhood, hub, hotel, FAQ, About, Terms, Privacy): its HTML as written, with the product rail
 * filled in, and links that move within the app (Delivery / Pickup buttons set the order mode).
 */
export function ContentPageView({ html, railProducts = [] }: ContentPageViewProps) {
  const router = useRouter();
  const { setFulfillment } = useCart();
  const ref = React.useRef<HTMLDivElement>(null);
  const [railSlot, setRailSlot] = React.useState<Element | null>(null);

  React.useEffect(() => {
    setRailSlot(ref.current?.querySelector('[data-slot="rail-best"]') ?? null);
  }, [html]);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("/") || href.startsWith("//") || a.target) return;
    e.preventDefault();
    const url = new URL(href, window.location.origin);
    const mode = url.searchParams.get("mode");
    if (mode === "delivery" || mode === "pickup") {
      // Pickup shows the "pickup is paused" notice when the store has it off
      setFulfillment(mode);
      url.searchParams.delete("mode");
    }
    router.push(url.pathname + url.search + url.hash);
  };

  return (
    <>
      {/* The page HTML is the client's own copy (no user input) */}
      <div ref={ref} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {railSlot &&
        createPortal(
          railProducts.map((p) => <ShopProductCard key={p.id} product={p} />),
          railSlot
        )}
    </>
  );
}
