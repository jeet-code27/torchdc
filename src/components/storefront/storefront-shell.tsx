"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { StoreStatusBar } from "./store-statusbar";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { StoreAddedToCartSheet } from "./store-added-to-cart-sheet";
import { OrderMinimumSheet } from "./order-minimum";
import { CheckoutOffer } from "./checkout-offer";
import { pageKey } from "@/lib/page-key";
import { LOCAL_BUSINESS_LD, jsonLd } from "@/lib/business-schema";
import { AreaGroupsProvider, type ExtraArea } from "./area-groups";

interface StorefrontShellProps {
  children: React.ReactNode;
  /** Neighborhood pages made on Admin › Pages (footer, menu and homepage lists) */
  extraAreas?: ExtraArea[];
}

const NO_EXTRA: ExtraArea[] = [];

export function StorefrontShell({ children, extraAreas = NO_EXTRA }: StorefrontShellProps) {
  const pathname = usePathname();

  // body[data-page] values match the client site; its CSS has page-specific rules keyed on them
  React.useEffect(() => {
    const page = pageKey(pathname || "/", extraAreas.map((a) => a.slug));
    if (page) document.body.setAttribute("data-page", page);
    else document.body.removeAttribute("data-page");
  }, [pathname, extraAreas]);

  const isExcluded = pathname?.startsWith("/admin");

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    // Plain block layout like the client site (a flex column would stop margins collapsing into the footer gap)
    <AreaGroupsProvider extra={extraAreas}>
    <div className="storefront">
      {/* Sitewide business schema (one per page) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(LOCAL_BUSINESS_LD) }} />

      {/* 1. Global Announcement Status Bar (Open Hours & Location) */}
      <StoreStatusBar />
      {/* People kept walking in at 1000 G St NW (client site, Nov 8) */}
      <div className="nowalkin">Delivery &amp; Curbside Pickup · No Walk-Ins</div>

      {/* 2. Persistent Global Navbar (Search, Cart Drawer, User Menu, Mobile Navigation) */}
      <StoreNavbar />

      {/* 3. Page Content (pages render their own <main class="shell__main">) */}
      {children}

      {/* 4. Global Brand Footer */}
      <StoreFooter />

      {/* 5. Global Added-to-Cart Slide-Up Sheet */}
      <StoreAddedToCartSheet />

      {/* 6. $60 order minimum popup */}
      <OrderMinimumSheet />

      {/* 7. "Want $10 Off Your Order?" cart pop-up */}
      <CheckoutOffer />
    </div>
    </AreaGroupsProvider>
  );
}
