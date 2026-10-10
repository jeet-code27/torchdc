"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { StoreStatusBar } from "./store-statusbar";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";

interface StorefrontShellProps {
  children: React.ReactNode;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();

  // Exclude admin dashboard, checkout, order-success, or studio
  const isExcluded =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/order-success");

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      {/* 1. Global Announcement Status Bar (Open Hours & Location) */}
      <StoreStatusBar />

      {/* 2. Persistent Global Navbar (Search, Cart Drawer, User Menu, Mobile Navigation) */}
      <StoreNavbar />

      {/* 3. Page Content */}
      <main className="flex-1">{children}</main>

      {/* 4. Global Brand Footer */}
      <StoreFooter />
    </div>
  );
}
