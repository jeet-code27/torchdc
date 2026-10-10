"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShieldCheck, ArrowRight, ShoppingBag, Truck, Clock } from "lucide-react";
import { useCart, FulfillmentType } from "@/context/cart-context";
import { CartAddToOrder } from "./cart-add-to-order";

export function ShopCartSidebar() {
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

  return (
    <aside className="w-72 xl:w-80 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none">
      <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-xs flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[18px] text-neutral-900">
            Your order
          </h3>
          {totalCount > 0 && (
            <span className="text-xs bg-[#eef5ee] text-[#2F4F30] font-bold px-2.5 py-0.5 rounded-full">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Fulfillment Mode Toggle */}
        <div className="bg-neutral-100 p-1 rounded-full flex items-center mb-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFulfillment("delivery")}
            className={`flex-1 py-2 text-center rounded-full transition-all cursor-pointer ${
              fulfillment === "delivery"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setFulfillment("pickup")}
            className={`flex-1 py-2 text-center rounded-full transition-all cursor-pointer ${
              fulfillment === "pickup"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Pickup
          </button>
        </div>

        {/* Location / ETA note */}
        <p className="text-[12px] text-neutral-500 text-center mb-4 leading-normal">
          {fulfillment === "delivery"
            ? "Free delivery across DC · about 35 to 45 min"
            : "Curbside pickup at 1025 F St NW · Ready in 15 min"}
        </p>

        {/* Cart items list or empty state */}
        {items.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="font-bold text-[14px] text-neutral-800">
              Your cart is empty
            </p>
            <p className="text-[12px] text-neutral-400 mt-1 max-w-[200px]">
              Tap + on anything in the menu to start your order.
            </p>

            {/* Quick Delivery Guarantees */}
            <div className="w-full mt-6 pt-5 border-t border-neutral-100 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                <Truck className="w-3.5 h-3.5 text-[#557754] shrink-0" />
                <span>Free delivery across Washington DC</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                <Clock className="w-3.5 h-3.5 text-[#557754] shrink-0" />
                <span>Fast 35 to 45 minute arrival</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                <ShieldCheck className="w-3.5 h-3.5 text-[#557754] shrink-0" />
                <span>21+ valid government ID required</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* Scrollable list */}
            <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-100">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.weight}`}
                  className="pt-3 first:pt-0 flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-lg bg-neutral-100 p-1 flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] text-neutral-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {item.weight || "3.5g"} · ${item.price} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-neutral-100 rounded-full px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.weight)
                      }
                      className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-neutral-900 min-w-[14px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.weight)
                      }
                      className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <span className="font-extrabold text-[14px] text-neutral-900 min-w-[42px] text-right">
                    ${item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-neutral-200/80 pt-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-extrabold text-[15px] pt-2 border-t border-dashed border-neutral-200">
                <span>Estimated Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA Button */}
            <Link
              href="/checkout"
              className="w-full mt-4 bg-[#5A805B] hover:bg-[#466645] active:scale-[0.99] text-white font-extrabold py-3.5 px-5 rounded-full text-center text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* ID Notice */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Valid 21+ government ID required</span>
            </div>

            {/* Add to your order suggestions */}
            <CartAddToOrder compact={true} className="mt-4 pt-3 border-t border-neutral-100" />
          </div>
        )}
      </div>
    </aside>
  );
}
