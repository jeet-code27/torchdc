"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { CartAddToOrder } from "./cart-add-to-order";

export function StoreCartDrawer() {
  const {
    items,
    fulfillment,
    setFulfillment,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalCount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartDrawerOpen(false);
    };
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#5A805B]" />
            <h3 className="font-extrabold text-lg text-neutral-900">Your Cart</h3>
            {totalCount > 0 && (
              <span className="text-xs bg-[#5A805B]/10 text-[#5A805B] font-black px-2.5 py-0.5 rounded-full">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fulfillment Mode Switcher */}
        <div className="p-4 bg-neutral-50/70 border-b border-neutral-100">
          <div className="bg-neutral-200/70 p-1 rounded-full flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`flex-1 py-1.5 text-center rounded-full transition-all cursor-pointer ${
                fulfillment === "delivery"
                  ? "bg-white text-neutral-900 shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`flex-1 py-1.5 text-center rounded-full transition-all cursor-pointer ${
                fulfillment === "pickup"
                  ? "bg-white text-neutral-900 shadow-xs font-black"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-neutral-100">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-neutral-800 text-base">Your cart is empty</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Explore our premium Washington D.C. menu to add flower, vapes, and edibles.
              </p>
              <Link
                href="/shop"
                onClick={() => setIsCartDrawerOpen(false)}
                className="inline-block mt-2 bg-[#5A805B] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#4a6b4b] transition-all"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${item.weight || ""}-${idx}`} className="pt-3.5 first:pt-0 flex gap-3.5 items-center">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/80 overflow-hidden relative shrink-0">
                  <Image
                    src={typeof item.image === "string" && item.image ? item.image : "/images/placeholder-product.png"}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs text-neutral-900 truncate">
                    {item.name}
                  </h5>
                  {item.weight && (
                    <span className="inline-block text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded mt-0.5">
                      {item.weight}
                    </span>
                  )}
                  <p className="text-xs font-black text-neutral-900 mt-1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-neutral-100 rounded-full px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.weight)}
                    className="w-6 h-6 rounded-full bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-neutral-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.weight)}
                    className="w-6 h-6 rounded-full bg-white text-neutral-700 flex items-center justify-center hover:bg-neutral-200 cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id, item.weight)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}

          {/* Add to your order suggestions */}
          <CartAddToOrder compact={true} className="pt-3 border-t border-neutral-100" />
        </div>

        {/* Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 font-medium">Subtotal</span>
              <span className="text-lg font-black text-neutral-900 font-mono">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-3 rounded-full text-xs font-bold text-center border border-neutral-300 text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                View Cart Page
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartDrawerOpen(false)}
                className="w-full py-3 rounded-full text-xs font-extrabold text-center bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-[10px] text-neutral-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#5A805B]" />
              Initiative 71 Compliant • Cash On Delivery
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
