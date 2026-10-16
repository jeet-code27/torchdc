"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { StoreStatusBar } from "./store-statusbar";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { StoreAddedToCartSheet } from "./store-added-to-cart-sheet";
import { AREAS_BY_SLUG } from "@/lib/areas-data";

const STATIC_PAGES: Record<string, string> = {
  "/": "home",
  "/shop": "shop",
  "/flowers": "flowers",
  "/deals": "deals",
  "/cart": "cart",
  "/about": "about",
  "/contact": "contact",
  "/contact-us": "contact",
  "/faq": "faq",
  "/privacy-policy": "legal",
  "/terms-conditions": "legal",
};

function pageKey(pathname: string): string | null {
  if (STATIC_PAGES[pathname]) return STATIC_PAGES[pathname];
  if (pathname.startsWith("/product/")) return "product";
  if (AREAS_BY_SLUG[pathname.replace(/^\/|\/$/g, "")]) return "area";
  return null;
}

interface StorefrontShellProps {
  children: React.ReactNode;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();

  // body[data-page] values match the client site; its CSS has page-specific rules keyed on them
  React.useEffect(() => {
    const page = pageKey(pathname || "/");
    if (page) document.body.setAttribute("data-page", page);
    else document.body.removeAttribute("data-page");
  }, [pathname]);

  const isExcluded = pathname?.startsWith("/admin");

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    // Plain block layout like the client site (a flex column would stop margins collapsing into the footer gap)
    <div className="storefront">
      {/* 1. Global Announcement Status Bar (Open Hours & Location) */}
      <StoreStatusBar />

      {/* 2. Persistent Global Navbar (Search, Cart Drawer, User Menu, Mobile Navigation) */}
      <StoreNavbar />

      {/* 3. Page Content (pages render their own <main class="shell__main">) */}
      {children}

      {/* 4. Global Brand Footer */}
      <StoreFooter />

      {/* 5. Global Added-to-Cart Slide-Up Sheet */}
      <StoreAddedToCartSheet />
    </div>
  );
}
