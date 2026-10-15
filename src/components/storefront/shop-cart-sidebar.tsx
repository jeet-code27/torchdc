"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export function ShopCartSidebar() {
  const {
    items,
    fulfillment,
    setFulfillment,
    updateQuantity,
    removeItem,
    subtotal,
    deals,
    finalTotal,
    hasPrerollBonus,
  } = useCart();

  return (
    <aside className="dcart" aria-label="Your order">
      <h2>Your order</h2>

      {/* Segmented Delivery / Pickup */}
      <div className="seg" role="tablist" aria-label="Delivery or pickup">
        <button
          type="button"
          role="tab"
          aria-selected={fulfillment === "delivery"}
          className={fulfillment === "delivery" ? "is-on" : ""}
          onClick={() => setFulfillment("delivery")}
        >
          Delivery
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={fulfillment === "pickup"}
          className={fulfillment === "pickup" ? "is-on" : ""}
          onClick={() => setFulfillment("pickup")}
        >
          Pickup
        </button>
      </div>

      <span className="dcart__note">
        {fulfillment === "delivery"
          ? "Free delivery across DC"
          : "Pickup at 1000 G St NW"}
      </span>

      {items.length === 0 ? (
        <div className="dcart__empty">
          <strong>Your cart is empty</strong>
          <span>Tap + on anything in the menu.</span>
        </div>
      ) : (
        <>
          {/* Cart Item Lines */}
          <div className="dcart__lines">
            {items.map((item) => (
              <div key={`${item.id}-${item.weight || "def"}`} className="dline">
                <span className="dline__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || "/assets/img/logo.webp"}
                    alt={item.name}
                  />
                </span>
                <span className="dline__t">
                  <strong>{item.name}</strong>
                  <span>
                    {[item.tier, item.weight].filter(Boolean).join(" · ")}
                  </span>
                  <b>${item.price * item.quantity}</b>
                </span>
                <span className="mini">
                  <button
                    type="button"
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.id, item.weight)
                        : updateQuantity(item.id, item.quantity - 1, item.weight)
                    }
                    aria-label={item.quantity === 1 ? "Remove item" : "Remove one"}
                  >
                    {item.quantity === 1 ? "×" : "−"}
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1, item.weight)
                    }
                    aria-label="Add one"
                  >
                    +
                  </button>
                </span>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="dcart__sum">
            <span>
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </span>

            {deals.items.map((d, i) => (
              <span key={i} className="ok">
                <span>{d.label}</span>
                <span>−${d.amount}</span>
              </span>
            ))}

            <span>
              <span>{fulfillment === "delivery" ? "Delivery" : "Pickup"}</span>
              <span className="ok">Free</span>
            </span>

            {hasPrerollBonus && (
              <span className="ok">
                <span>Free pre-roll</span>
                <span>$0</span>
              </span>
            )}

            <span style={{ fontWeight: 800, fontSize: 16 }}>
              <span>Total</span>
              <span>${finalTotal}</span>
            </span>
          </div>

          {/* Checkout CTA */}
          <Link className="checkoutbtn" href="/cart">
            CHECKOUT · ${finalTotal}
          </Link>

          <span className="dcart__pay">Pay with cash at the door</span>
        </>
      )}
    </aside>
  );
}
