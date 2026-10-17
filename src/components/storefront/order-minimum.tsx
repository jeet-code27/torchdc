"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, MIN_ORDER } from "@/context/cart-context";

/** Pre-rolls suggested to close the gap (MIN_PICKS on the client site). */
const MIN_PICK_SLUGS = ["top-shelf-1g-pre-rolls", "exotic-1g-pre-rolls"];

interface MinPick {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  weight: string;
}

/** "Add $X more to reach the $60 order minimum" button; renders nothing once the minimum is met. */
export function MinNote() {
  const { minShortfall, setIsMinSheetOpen } = useCart();
  if (minShortfall <= 0) return null;
  return (
    <button type="button" className="minnote" onClick={() => setIsMinSheetOpen(true)}>
      Add <b>${minShortfall}</b> more to reach the ${MIN_ORDER} order minimum <u>See ideas</u>
    </button>
  );
}

/** Centered "Almost there!" popup with pre-roll picks (drawMin()/openMin() on the client site). */
export function OrderMinimumSheet() {
  const { items, finalTotal, minShortfall, isMinSheetOpen, setIsMinSheetOpen, addItem, updateQuantity } = useCart();
  const pathname = usePathname();
  const [picks, setPicks] = React.useState<MinPick[]>([]);

  // Load the suggested pre-rolls once
  React.useEffect(() => {
    let alive = true;
    fetch("/api/products?category=pre-rolls&limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !Array.isArray(data?.products)) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bySlug = new Map<string, any>(data.products.map((p: any) => [p.slug, p]));
        setPicks(
          MIN_PICK_SLUGS.map((slug) => bySlug.get(slug))
            .filter(Boolean)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => ({
              id: String(p._id),
              name: p.name,
              slug: p.slug,
              price: p.variants?.[0]?.price ?? p.price ?? 0,
              image: p.images?.find((i: { isPrimary?: boolean }) => i.isPrimary)?.url || p.images?.[0]?.url || "/assets/img/preroll.webp",
              weight: p.variants?.[0]?.name || "",
            }))
        );
      })
      .catch(() => null);
    return () => {
      alive = false;
    };
  }, []);

  // On the cart page, open once per session when the order is short (like the client site)
  React.useEffect(() => {
    if (pathname !== "/cart" || minShortfall <= 0) return;
    try {
      if (sessionStorage.getItem("torch_minseen")) return;
      sessionStorage.setItem("torch_minseen", "1");
    } catch {
      return;
    }
    const t = window.setTimeout(() => setIsMinSheetOpen(true), 500);
    return () => window.clearTimeout(t);
  }, [pathname, minShortfall, setIsMinSheetOpen]);

  if (!isMinSheetOpen) return null;

  const close = () => setIsMinSheetOpen(false);
  const pct = Math.min(100, Math.round((finalTotal / MIN_ORDER) * 100));

  return (
    <div className="sheet" data-minsheet="">
      <div className="sheet__bg" onClick={close} aria-hidden="true" />
      <div className="sheet__card" role="dialog" aria-modal="true" aria-label="Order minimum">
        {minShortfall > 0 ? (
          <>
            <div className="minhead">
              <strong>
                You&apos;re ${minShortfall} away from the ${MIN_ORDER} minimum
              </strong>
              <span>Almost there! Just add a pre-roll or two.</span>
            </div>
            <div className="minbar" aria-hidden="true">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="minlist">
              {picks.map((a) => {
                const line = items.find((i) => i.id === a.id);
                const q = line?.quantity || 0;
                const n = a.price > 0 ? Math.ceil(minShortfall / a.price) : 0;
                return (
                  <div key={a.id} className="minrow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image} alt="" />
                    <span className="minrow__t">
                      <strong>{a.name}</strong>
                      <span>
                        ${a.price} each · <em>+{n} gets you there</em>
                      </span>
                    </span>
                    {q ? (
                      <span className="mini">
                        <button
                          type="button"
                          aria-label="Remove one"
                          onClick={() => updateQuantity(a.id, q - 1, line?.weight)}
                        >
                          −
                        </button>
                        <span>{q}</span>
                        <button
                          type="button"
                          aria-label="Add one"
                          onClick={() => updateQuantity(a.id, q + 1, line?.weight)}
                        >
                          +
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="addsm"
                        aria-label={`Add ${a.name}`}
                        onClick={() =>
                          addItem(
                            { id: a.id, name: a.name, slug: a.slug, price: a.price, image: a.image, weight: a.weight, category: "pre-rolls" },
                            1,
                            { showSheet: false }
                          )
                        }
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="sheet__btns sheet__btns--one">
              <button type="button" className="ghostbtn" onClick={close}>
                Keep shopping
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="minhead minhead--ok">
              <span className="okdot">✓</span>
              <strong>You&apos;re all set</strong>
              <span>
                Your order is ${finalTotal}. The ${MIN_ORDER} minimum is met.
              </span>
            </div>
            <div className="sheet__btns">
              <button type="button" className="ghostbtn" onClick={close}>
                Keep shopping
              </button>
              {pathname === "/cart" ? (
                <button type="button" className="checkoutbtn" onClick={close}>
                  Continue to checkout
                </button>
              ) : (
                <Link className="checkoutbtn" href="/cart" onClick={close}>
                  Checkout · ${finalTotal}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
