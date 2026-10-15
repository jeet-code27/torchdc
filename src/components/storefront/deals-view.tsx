"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { FlowerTier, DEALS, WEIGHTS } from "@/lib/deals";

interface TierNoteInfo {
  key: FlowerTier;
  label: string;
  tagline: string;
}

const TIER_META: Record<FlowerTier, TierNoteInfo> = {
  Midshelf: {
    key: "Midshelf",
    label: "Midshelf",
    tagline: "Quality flower, priced for value.",
  },
  Topshelf: {
    key: "Topshelf",
    label: "Topshelf",
    tagline: "Our core lineup, now in bulk.",
  },
  "Private Reserve": {
    key: "Private Reserve",
    label: "Private Reserve",
    tagline: "Small-batch exotics, better by the ounce.",
  },
};

export function DealsView() {
  const [selectedTier, setSelectedTier] = React.useState<FlowerTier>("Midshelf");
  const meta = TIER_META[selectedTier];
  const dealConfig = DEALS[selectedTier];
  const weightsConfig = WEIGHTS[selectedTier];

  // Base unit prices for calculating display savings
  const halfUnitPrice = weightsConfig["14g"] || 0;
  const ozUnitPrice = weightsConfig["1 oz"] || 0;

  return (
    <div className="shell">
      {/* ================= 1. DESKTOP LEFT RAIL (Menu Navigation) ================= */}
      <ShopSidebar activeCategory="deals" />

      {/* ================= 2. MAIN CENTER CONTENT (Deals Cards) ================= */}
      <main className="shell__main" style={{ padding: "18px 0 40px" }}>
        {/* ================= TIER SWITCHER TABS ================= */}
        <div className="seg seg--3 seg--green" role="tablist" aria-label="Select flower tier">
          {(["Midshelf", "Topshelf", "Private Reserve"] as FlowerTier[]).map((tier) => {
            const isActive = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedTier(tier)}
                className={isActive ? "is-on" : ""}
                style={isActive ? { color: "#FFFFFF" } : undefined}
              >
                {tier}
              </button>
            );
          })}
        </div>

        {/* ================= PAGE TITLE & TAGLINE ================= */}
        <div className="dealhead">
          <span className="eyebrow" style={{ color: "var(--green)", fontWeight: 800, fontSize: "11px", letterSpacing: "0.8px" }}>
            BULK SAVINGS
          </span>
          <h1>Deals</h1>
          <span className="muted" style={{ fontSize: "14px", color: "var(--site-muted)" }}>
            {meta.tagline}
          </span>
        </div>

        {/* ================= 1. WAKE & BAKE CARD ================= */}
        <div className="wake">
          <span className="wake__tag">9AM TO 12PM ONLY</span>
          <div className="wake__t">Wake &amp; Bake</div>
          <span className="muted" style={{ fontSize: "14px", color: "var(--site-muted)" }}>
            Half ounce of {selectedTier} for just
          </span>

          <div className="wake__row">
            <span className="wake__p">${dealConfig.wake}</span>

            <Link
              href={`/flowers?tier=${encodeURIComponent(selectedTier)}`}
              className="wake__go"
              style={{ color: "#FFFFFF" }}
            >
              Pick a strain
            </Link>
          </div>

          <span className="fine" style={{ fontSize: "12px", color: "var(--site-muted)", lineHeight: 1.5 }}>
            Limit 1 per customer per day. Applied automatically in your cart during these hours.
          </span>
        </div>

        {/* ================= 2. NEW HERE? PROMO CALLOUT ================= */}
        <div className="newhere">
          <span className="newhere__ic">
            <Check className="w-4 h-4 stroke-[3]" style={{ stroke: "#FFFFFF", color: "#FFFFFF" }} />
          </span>
          <span>
            <strong>New Here?</strong>
            <span>Let us know it&apos;s your first order and we&apos;ll throw in something on the house.</span>
          </span>
        </div>

        {/* ================= 3. BUNDLE DEAL, STACK & SAVE, HALF POUND HAUL ================= */}
        <div className="dealcards">
          {/* Bundle Deal */}
          <div className="dealcard">
            <div className="dealcard__h">
              <strong>Bundle Deal</strong>
              <span className="dealtag">MOST POPULAR</span>
            </div>
            <span className="muted" style={{ fontSize: "14px", color: "var(--site-muted)" }}>
              Mix any {selectedTier} strains by the half ounce.
            </span>

            <div className="pt-1">
              {[2, 3, 4].map((count) => {
                const dealPrice = dealConfig.half[count];
                const regularPrice = halfUnitPrice * count;
                const save = regularPrice - dealPrice;

                return (
                  <div key={count} className="drow">
                    <span>
                      <strong>{count} half ounces</strong>
                      {save > 0 && (
                        <span className="ok" style={{ color: "var(--green-mid)", fontWeight: 700, fontSize: "13px" }}>
                          Save ${save}
                        </span>
                      )}
                    </span>

                    <b>${dealPrice}</b>

                    <Link
                      href={`/flowers?tier=${encodeURIComponent(selectedTier)}`}
                      className="drow__go"
                      style={{ color: "#FFFFFF" }}
                      aria-label={`Pick strain for ${count} half ounces`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" style={{ stroke: "#FFFFFF", color: "#FFFFFF" }} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stack & Save */}
          <div className="dealcard">
            <div className="dealcard__h">
              <strong>Stack &amp; Save</strong>
              <span className="dealtag">BEST VALUE</span>
            </div>
            <span className="muted" style={{ fontSize: "14px", color: "var(--site-muted)" }}>
              Stock up by the ounce and save more with every one.
            </span>

            <div className="pt-1">
              {[2, 3, 4].map((count) => {
                const dealPrice = dealConfig.oz[count];
                const regularPrice = ozUnitPrice * count;
                const save = regularPrice - dealPrice;

                return (
                  <div key={count} className="drow">
                    <span>
                      <strong>{count} oz</strong>
                      {save > 0 && (
                        <span className="ok" style={{ color: "var(--green-mid)", fontWeight: 700, fontSize: "13px" }}>
                          Save ${save}
                        </span>
                      )}
                    </span>

                    <b>${dealPrice}</b>

                    <Link
                      href={`/flowers?tier=${encodeURIComponent(selectedTier)}`}
                      className="drow__go"
                      style={{ color: "#FFFFFF" }}
                      aria-label={`Pick strain for ${count} oz`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" style={{ stroke: "#FFFFFF", color: "#FFFFFF" }} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* The Half-Pound Haul */}
          <div className="dealcard">
            <div className="dealcard__h">
              <strong>The Half-Pound Haul</strong>
              <span className="dealtag">BIGGEST SAVINGS</span>
            </div>
            <span className="muted" style={{ fontSize: "14px", color: "var(--site-muted)" }}>
              Half a pound of {selectedTier} at our lowest price.
            </span>

            <div className="pt-1">
              {(() => {
                const dealPrice = dealConfig.haul;
                const regularPrice = ozUnitPrice * 8;
                const save = regularPrice - dealPrice;

                return (
                  <div className="drow">
                    <span>
                      <strong>8 oz</strong>
                      {save > 0 && (
                        <span className="ok" style={{ color: "var(--green-mid)", fontWeight: 700, fontSize: "13px" }}>
                          Save ${save}
                        </span>
                      )}
                    </span>

                    <b>${dealPrice}</b>

                    <Link
                      href={`/flowers?tier=${encodeURIComponent(selectedTier)}`}
                      className="drow__go"
                      style={{ color: "#FFFFFF" }}
                      aria-label="Pick strain for 8 oz"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" style={{ stroke: "#FFFFFF", color: "#FFFFFF" }} />
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ================= FOOTER NOTE ================= */}
        <p className="fine" style={{ textAlign: "center", padding: "18px 0 24px", color: "var(--site-muted)", fontSize: "13px" }}>
          Deals apply automatically in your cart when you add the matching flower.
        </p>
      </main>

      {/* ================= 3. DESKTOP RIGHT RAIL (Order Sidebar) ================= */}
      <ShopCartSidebar />

      <ShopStickyCartBar />
    </div>
  );
}
