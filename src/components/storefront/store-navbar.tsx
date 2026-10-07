"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, ShoppingCart, Menu, X, ArrowRight } from "lucide-react";

export function StoreNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* ================= DESKTOP LEFT NAVIGATION ================= */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1">
            {/* Phone Button */}
            <a
              href="tel:+12024681966"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              title="Call Torch DC: (202) 468-1966"
              aria-label="Call Torch DC"
            >
              <Phone className="w-4 h-4" />
            </a>

            <nav className="flex items-center gap-6 lg:gap-8 text-[15px] font-semibold text-gray-800">
              <Link
                href="/shop"
                className="hover:text-[#557954] transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/category/flowers"
                className="hover:text-[#557954] transition-colors"
              >
                Flowers
              </Link>
              <Link
                href="/deals"
                className="hover:text-[#557954] transition-colors text-[#557954]"
              >
                Deals
              </Link>
            </nav>
          </div>

          {/* ================= MOBILE LEFT (Phone button) ================= */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href="tel:+12024681966"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              aria-label="Call Torch DC"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* ================= CENTER LOGO ================= */}
          <div className="flex items-center justify-center shrink-0">
            <Link href="/" className="flex items-center py-2" title="Torch Dispensary Home">
              <Image
                src="/images/torch-logo.svg"
                alt="Torch Dispensary"
                width={170}
                height={48}
                priority
                className="h-10 sm:h-12 w-auto max-w-[150px] sm:max-w-[170px] object-contain drop-shadow-xs"
              />
            </Link>
          </div>

          {/* ================= DESKTOP RIGHT NAVIGATION ================= */}
          <div className="hidden md:flex items-center justify-end gap-6 lg:gap-8 flex-1">
            <nav className="flex items-center gap-6 lg:gap-8 text-[15px] font-semibold text-gray-800">
              <Link
                href="/about"
                className="hover:text-[#557954] transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-[#557954] transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Cart Pill Button */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 bg-[#557954] hover:bg-[#486847] text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all group"
            >
              <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Cart</span>
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                0
              </span>
            </Link>
          </div>

          {/* ================= MOBILE RIGHT (Cart circle button + menu toggle) ================= */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/cart"
              className="w-10 h-10 rounded-full bg-[#557954] text-white flex items-center justify-center shadow-xs"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          <nav className="flex flex-col gap-2.5 text-base font-semibold text-gray-800">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Shop All</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/category/flowers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Flowers</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/deals"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-emerald-50 text-[#557954] flex items-center justify-between"
            >
              <span>Today&apos;s Deals</span>
              <span className="text-xs bg-[#557954] text-white px-2 py-0.5 rounded-full font-bold">Hot</span>
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>About Us</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Contact</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
