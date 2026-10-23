"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

const OFFER_SMS =
  "sms:+12024681966?&body=" +
  encodeURIComponent("Hey there! I saw the $10 off and free pre-roll offer on your website. How do I claim it?");

/**
 * "Want $10 Off Your Order?" pop-up (maybeOffer()/openOffer() on the client site, Oct 22).
 * Cart page only, once per browser session, only when the cart has items and the $60 minimum is met,
 * never on top of the minimum pop-up. It never changes the cart or applies a discount.
 * On/off: Admin dashboard -> "Want $10 Off Your Order?" switch.
 */
export function CheckoutOffer() {
  const { items, minShortfall, isMinSheetOpen, isOfferPopupEnabled } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [showNumber, setShowNumber] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOfferPopupEnabled || pathname !== "/cart" || items.length === 0 || minShortfall > 0 || isMinSheetOpen) {
      return;
    }
    try {
      if (sessionStorage.getItem("torch_offerseen")) return;
      sessionStorage.setItem("torch_offerseen", "1");
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [isOfferPopupEnabled, pathname, items.length, minShortfall, isMinSheetOpen]);

  // Close with Esc; focus the card while open, then hand focus back
  React.useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      back?.focus?.();
    };
  }, [open]);

  // The order went through (cart emptied) or the user left the cart page
  React.useEffect(() => {
    if (pathname !== "/cart" || items.length === 0) setOpen(false);
  }, [pathname, items.length]);

  if (!open) return null;

  const onAsk = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const touch = window.matchMedia?.("(pointer: coarse)").matches;
    if (touch) {
      // Phones: the link opens a text to the store; close the card behind it
      window.setTimeout(() => setOpen(false), 300);
      return;
    }
    // Computers: show the number on the card instead
    e.preventDefault();
    setShowNumber(true);
  };

  return (
    <div
      className="offer"
      data-offer=""
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={cardRef}
        className="offer__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        tabIndex={-1}
      >
        <button className="offer__x" type="button" aria-label="Close" onClick={() => setOpen(false)}>
          ✕
        </button>
        <h2 className="offer__title" id="offer-title">
          Want $10 Off Your Order?
        </h2>
        <p className="offer__text">
          Plus a <b>free pre-roll</b>. You may already qualify,{" "}
          <span style={{ whiteSpace: "nowrap" }}>no sign-up required.</span>
        </p>
        <a className="offer__cta" href={OFFER_SMS} hidden={showNumber} onClick={onAsk}>
          Ask Us How
        </a>
        <p className="offer__num" hidden={!showNumber}>
          <small>Text or call us</small>
          <b>(202) 468-1966</b>
        </p>
        <p className="offer__fine">Terms and conditions apply.</p>
      </div>
    </div>
  );
}
