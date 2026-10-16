"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { StoreStatusBar } from "./store-statusbar";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { StoreAddedToCartSheet } from "./store-added-to-cart-sheet";

interface StorefrontShellProps {
  children: React.ReactNode;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      if (pathname === "/") {
        document.body.setAttribute("data-page", "home");
      } else if (pathname === "/deals") {
        document.body.setAttribute("data-page", "deals");
      } else if (pathname === "/cart") {
        document.body.setAttribute("data-page", "cart");
      } else if (pathname === "/flowers") {
        document.body.setAttribute("data-page", "flowers");
      } else if (pathname?.startsWith("/product/")) {
        document.body.setAttribute("data-page", "product");
      } else {
        document.body.removeAttribute("data-page");
      }
    }
  }, [pathname]);

  const isExcluded = pathname?.startsWith("/admin");

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="storefront min-h-screen flex flex-col">
      {/* 1. Global Announcement Status Bar (Open Hours & Location) */}
      <StoreStatusBar />

      {/* 2. Persistent Global Navbar (Search, Cart Drawer, User Menu, Mobile Navigation) */}
      <StoreNavbar />

      {/* 3. Page Content (pages render their own <main class="shell__main">) */}
      <div className="flex-1">{children}</div>

      {/* 4. Global Brand Footer */}
      <StoreFooter />

      {/* 5. Global Added-to-Cart Slide-Up Sheet */}
      <StoreAddedToCartSheet />
    </div>
  );
}
