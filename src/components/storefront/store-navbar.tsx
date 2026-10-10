"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Package,
  MapPin,
  ChevronDown,
  Home,
  Tag,
  Info,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { CustomerAuthModal } from "./customer-auth-modal";
import { StoreCartDrawer } from "./store-cart-drawer";
import { STORE_CATEGORIES } from "./shop-sidebar";

export function StoreNavbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { totalCount, setIsCartDrawerOpen, fulfillment, setFulfillment } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const userDropdownRef = React.useRef<HTMLDivElement>(null);

  const isCustomer = Boolean(session?.user && session.user.role === "customer");
  const isAdminStaff = Boolean(
    session?.user && session.user.role && session.user.role !== "customer"
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-2xs">
        {/* ================= DESKTOP HEADER (Screenshots exact match) ================= */}
        <div className="hidden lg:block">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0" aria-label="Torch Home">
              <div className="relative w-36 h-11">
                <Image
                  src="/images/torch-logo.svg"
                  alt="Torch Dispensary"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Large Search Pill (Center) */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white text-sm text-neutral-800 placeholder-neutral-400 rounded-full pl-11 pr-10 py-2.5 outline-none border border-transparent focus:border-neutral-300 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Links, Sign In, Phone & Cart (Exact Screenshot Match) */}
            <div className="flex items-center gap-4 xl:gap-5 text-sm font-bold text-neutral-800">
              <Link href="/shop" className="hover:text-[#5A805B] transition-colors">
                Shop
              </Link>
              <Link href="/deals" className="hover:text-[#5A805B] transition-colors">
                Deals
              </Link>
              <Link href="/about" className="hover:text-[#5A805B] transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-[#5A805B] transition-colors">
                Contact
              </Link>

              {/* User Account / Sign In */}
              {session?.user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-neutral-100 text-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5A805B]/15 text-[#5A805B] flex items-center justify-center font-black text-xs uppercase">
                      {session.user.name ? session.user.name.charAt(0) : "U"}
                    </div>
                    <span className="text-xs font-bold max-w-[90px] truncate">
                      {session.user.name?.split(" ")[0] || "Account"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2 border-b border-neutral-100">
                        <p className="text-xs font-bold text-neutral-900 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        <Package className="w-3.5 h-3.5 text-[#5A805B]" />
                        <span>My Orders & Profile</span>
                      </Link>

                      {isAdminStaff && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left border-t border-neutral-100 mt-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="hover:text-[#5A805B] transition-colors text-sm font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-neutral-600" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Phone Button (Circle icon + number) */}
              <a
                href="tel:+12024681966"
                className="flex items-center gap-2 text-sm font-bold text-neutral-900 hover:text-[#5A805B] transition-colors ml-1"
                title="Call (202) 468-1966"
              >
                <span className="w-9 h-9 rounded-full bg-[#f4f7f4] flex items-center justify-center text-[#5A805B]">
                  <Phone className="w-4 h-4" />
                </span>
                <span className="font-extrabold tracking-tight">(202) 468-1966</span>
              </a>

              {/* Circular Cart Button (Opens Drawer, Exact Screenshot Match) */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative w-10 h-10 rounded-full bg-[#5A805B] hover:bg-[#4a6b4b] text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E8561E] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= MOBILE HEADER ================= */}
        <div className="lg:hidden px-4 py-3 flex items-center justify-between">
          {/* Left: Phone Call button */}
          <a
            href="tel:+12024681966"
            className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-700 flex items-center justify-center transition-colors"
            aria-label="Call Torch"
            title="Call (202) 468-1966"
          >
            <Phone className="w-4 h-4 text-[#5A805B]" />
          </a>

          {/* Centered Logo */}
          <Link href="/" className="relative w-32 h-9">
            <Image
              src="/images/torch-logo.svg"
              alt="Torch"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Right: Cart Button + Hamburger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative w-10 h-10 rounded-full bg-[#5A805B] text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E8561E] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OVER SIDEBAR DRAWER (Slides from LEFT) ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {/* Top Bar */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="relative w-32 h-10">
                <Image
                  src="/images/torch-logo.svg"
                  alt="Torch Dispensary"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Search Bar for Mobile Drawer */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }}
                className="relative"
              >
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100 text-xs rounded-full pl-9 pr-4 py-2.5 outline-none border border-transparent focus:border-neutral-300"
                />
              </form>

              {/* 1. Primary Site Navigation */}
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                  Navigation
                </span>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Home className="w-4 h-4 text-[#5A805B]" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Package className="w-4 h-4 text-[#5A805B]" />
                    <span>Shop</span>
                  </Link>
                  <Link
                    href="/deals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#5A805B] bg-[#5A805B]/10 hover:bg-[#5A805B]/15"
                  >
                    <span className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-[#E8561E]" />
                      <span>Deals</span>
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8561E] text-white">
                      HOT
                    </span>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Info className="w-4 h-4 text-[#5A805B]" />
                    <span>About</span>
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Phone className="w-4 h-4 text-[#5A805B]" />
                    <span>Contact</span>
                  </Link>
                </nav>
              </div>

              {/* 2. Menu */}
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                  Menu
                </span>
                <nav className="space-y-1">
                  {STORE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* 3. Order Mode Switch */}
              <div className="pt-3 border-t border-neutral-100">
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 px-1">
                  Order Mode
                </span>
                <div className="bg-neutral-100 p-1 rounded-full flex text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`flex-1 py-2 text-center rounded-full transition-all ${
                      fulfillment === "delivery"
                        ? "bg-[#5A805B] text-white font-black shadow-xs"
                        : "text-neutral-600"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`flex-1 py-2 text-center rounded-full transition-all ${
                      fulfillment === "pickup"
                        ? "bg-[#5A805B] text-white font-black shadow-xs"
                        : "text-neutral-600"
                    }`}
                  >
                    Pickup
                  </button>
                </div>
              </div>

              {/* 4. Customer Login / Profile */}
              <div className="pt-3 border-t border-neutral-100">
                {session?.user ? (
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-neutral-50 text-neutral-800"
                    >
                      <User className="w-4 h-4 text-[#5A805B]" />
                      <span>{session.user.name || "My Account"}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-bold border border-neutral-300 text-neutral-800 flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4 text-[#5A805B]" />
                    <span>Customer Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      <StoreCartDrawer />

      {/* Customer Login Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
