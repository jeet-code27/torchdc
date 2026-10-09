"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  Store,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const {
    items,
    fulfillment,
    setFulfillment,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
  } = useCart();

  const [promoCode, setPromoCode] = React.useState("");
  const [promoApplied, setPromoApplied] = React.useState(false);
  const [promoError, setPromoError] = React.useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === "TORCH10" || code === "FIRST20" || code === "WELCOME") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code. Please check and try again.");
    }
  };

  const discountAmount = promoApplied ? subtotal * 0.1 : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAF9]">
      <StoreNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-2 font-medium">
            <Link href="/" className="hover:text-neutral-700 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-neutral-700 transition">
              Shop
            </Link>
            <span>/</span>
            <span className="text-neutral-800 font-semibold">Shopping Cart</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2.5">
                <span>Your Cart</span>
                {totalCount > 0 && (
                  <span className="text-xs sm:text-sm font-bold bg-[#edf4ec] text-[#5A805B] px-3 py-1 rounded-full border border-[#5A805B]/20">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
                Fast DC delivery in 35-45 mins or 15-min curbside pickup.
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-neutral-400 hover:text-rose-600 transition flex items-center gap-1 self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          /* ================= EMPTY STATE ================= */
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-neutral-200/80 max-w-lg mx-auto shadow-xs my-8">
            <div className="w-20 h-20 rounded-full bg-[#edf4ec] text-[#5A805B] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Explore our curated menu of premium flowers, edibles, cartridges, and concentrates.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#5A805B] hover:bg-[#4d704e] active:scale-95 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <span>Explore Dispensary Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Category Shortcuts */}
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-3">
                Popular Categories
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <Link
                  href="/category/flowers"
                  className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-[#edf4ec] hover:text-[#5A805B] font-semibold text-neutral-700 transition"
                >
                  🌿 Flowers
                </Link>
                <Link
                  href="/category/edibles"
                  className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-[#edf4ec] hover:text-[#5A805B] font-semibold text-neutral-700 transition"
                >
                  🍬 Edibles
                </Link>
                <Link
                  href="/category/prerolls"
                  className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-[#edf4ec] hover:text-[#5A805B] font-semibold text-neutral-700 transition"
                >
                  🚬 Pre-Rolls
                </Link>
                <Link
                  href="/category/concentrates"
                  className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-[#edf4ec] hover:text-[#5A805B] font-semibold text-neutral-700 transition"
                >
                  🍯 Concentrates
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ================= ACTIVE CART GRID ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Order Fulfillment Mode Selector */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Select Order Mode
                  </span>
                  <span className="text-xs font-semibold text-[#5A805B]">
                    {fulfillment === "delivery" ? "Free DC Delivery" : "Ready in 15 mins"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 overflow-hidden ${
                      fulfillment === "delivery"
                        ? "border-[#5A805B] bg-[#edf4ec] text-neutral-900 shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-sm min-w-0">
                        <Truck className="w-4 h-4 text-[#5A805B] shrink-0" />
                        <span className="truncate">DC Delivery</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-[#5A805B] text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                        FREE
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium leading-normal">
                      Direct to your door · 35-45 mins
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 overflow-hidden ${
                      fulfillment === "pickup"
                        ? "border-[#5A805B] bg-[#edf4ec] text-neutral-900 shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-sm min-w-0">
                        <Store className="w-4 h-4 text-[#5A805B] shrink-0" />
                        <span className="truncate">Curbside Pickup</span>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full shrink-0">
                        15 MIN
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium leading-normal">
                      1025 F St NW, Washington, DC
                    </span>
                  </button>
                </div>
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden divide-y divide-neutral-100">
                {items.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div
                      key={`${item.id}-${item.weight || "default"}`}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200/60">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {item.category && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                {item.category}
                              </span>
                            )}
                            {item.weight && (
                              <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">
                                {item.weight}
                              </span>
                            )}
                            {item.tier && (
                              <span className="text-[10px] font-bold bg-[#edf4ec] text-[#5A805B] px-2 py-0.5 rounded-md">
                                {item.tier}
                              </span>
                            )}
                          </div>

                          <Link
                            href={item.slug ? `/product/${item.slug}` : "/shop"}
                            className="font-bold text-sm sm:text-base text-neutral-900 hover:text-[#5A805B] transition truncate block"
                          >
                            {item.name}
                          </Link>

                          <div className="text-xs text-neutral-500 font-semibold mt-0.5">
                            ${item.price.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Stepper & Line Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-neutral-100 rounded-xl p-1 border border-neutral-200/70">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, Math.max(0, item.quantity - 1), item.weight)
                            }
                            className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition shadow-2xs"
                            aria-label="Decrease quantity"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <span className="w-8 text-center font-bold text-xs text-neutral-900">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1, item.weight)
                            }
                            className="w-7 h-7 rounded-lg bg-white hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition shadow-2xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[70px]">
                          <span className="font-extrabold text-sm sm:text-base text-neutral-900 block">
                            ${lineTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.weight)}
                          className="p-1.5 text-neutral-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="flex items-center justify-between">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-900 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping Dispensary Menu</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Checkout Card */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-5 sticky top-24">
                <h2 className="text-base font-extrabold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary
                </h2>

                {/* Promo Code Input */}
                <div>
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo Code"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-[#5A805B] focus:ring-1 focus:ring-[#5A805B]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </form>
                  {promoApplied && (
                    <p className="text-[11px] text-[#5A805B] font-bold mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 10% Discount applied successfully!
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1.5">
                      {promoError}
                    </p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex items-center justify-between text-[#5A805B] font-bold">
                      <span>Promo Discount (10%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      <span className="text-[10px] text-neutral-400">(Washington DC)</span>
                    </span>
                    <span className="font-extrabold text-[#5A805B] uppercase text-[11px] bg-[#edf4ec] px-2 py-0.5 rounded-full">
                      Free
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span>DC Sales Tax</span>
                    <span className="font-bold text-neutral-900">$0.00</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-base font-black text-neutral-900">
                    <span>Estimated Total</span>
                    <span className="text-xl text-[#5A805B]">${estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-2xl bg-[#5A805B] hover:bg-[#4d704e] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-2 font-medium">
                    <Truck className="w-3.5 h-3.5 text-[#5A805B] shrink-0" />
                    <span>Free DC delivery in 35-45 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#5A805B] shrink-0" />
                    <span>Cash on Delivery / Pickup accepted</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5A805B] shrink-0" />
                    <span>Initiative 71 Compliant · 21+ ID Required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
