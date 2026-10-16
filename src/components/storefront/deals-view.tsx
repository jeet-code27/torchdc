"use client";

import * as React from "react";
import Link from "next/link";
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

  // Savings are shown against the tier chart price per unit (same as the client deals page)
  const halfUnitPrice = weightsConfig["14g"] || 0;
  const ozUnitPrice = weightsConfig["1 oz"] || 0;
  const shopHref = `/flowers?tier=${encodeURIComponent(selectedTier)}`;

  const cards = [
    {
      title: "Bundle Deal",
      tag: "MOST POPULAR",
      desc: `Mix any ${selectedTier} strains by the half ounce.`,
      rows: [2, 3, 4].map((k) => ({ label: `${k} half ounces`, price: dealConfig.half[k], save: halfUnitPrice * k - dealConfig.half[k] })),
    },
    {
      title: "Stack & Save",
      tag: "BEST VALUE",
      desc: "Stock up by the ounce and save more with every one.",
      rows: [2, 3, 4].map((k) => ({ label: `${k} oz`, price: dealConfig.oz[k], save: ozUnitPrice * k - dealConfig.oz[k] })),
    },
    {
      title: "The Half-Pound Haul",
      tag: "BIGGEST SAVINGS",
      desc: `Half a pound of ${selectedTier} at our lowest price.`,
      rows: [{ label: "8 oz", price: dealConfig.haul, save: ozUnitPrice * 8 - dealConfig.haul }],
    },
  ];

  // Markup mirrors client-reference/deals.html + dealsPage() in site.js
  return (
    <div className="shell">
      <ShopSidebar activeCategory="deals" />

      <main className="shell__main">
        <div className="seg seg--green seg--3" role="tablist" aria-label="Flower tier">
          {(["Midshelf", "Topshelf", "Private Reserve"] as FlowerTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              role="tab"
              aria-selected={selectedTier === tier}
              className={selectedTier === tier ? "is-on" : ""}
              onClick={() => setSelectedTier(tier)}
            >
              {tier}
            </button>
          ))}
        </div>

        <section className="dealhead">
          <span className="eyebrow">BULK SAVINGS</span>
          <h1>Deals</h1>
          <span className="muted">{meta.tagline}</span>
        </section>

        <div className="wake">
          <span className="wake__tag">9AM TO 12PM ONLY</span>
          <span className="wake__t">Wake &amp; Bake</span>
          <span>Half ounce of {selectedTier} for just</span>
          <div className="wake__row">
            <span className="wake__p">${dealConfig.wake}</span>
            <Link className="wake__go" href={shopHref}>
              Pick a strain
            </Link>
          </div>
          <span className="fine">Limit 1 per customer per day. Applied automatically in your cart during these hours.</span>
        </div>

        <div className="newhere">
          <span className="newhere__ic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <span>
            <strong>New Here?</strong>
            <span>Let us know it&apos;s your first order and we&apos;ll throw in something on the house.</span>
          </span>
        </div>

        <div className="dealcards">
          {cards.map((c) => (
            <div key={c.title} className="dealcard">
              <div className="dealcard__h">
                <strong>{c.title}</strong>
                <span className="dealtag">{c.tag}</span>
              </div>
              <span className="muted">{c.desc}</span>
              {c.rows.map((r) => (
                <div key={r.label} className="drow">
                  <span>
                    <strong>{r.label}</strong>
                    {r.save > 0 && <span className="ok">Save ${r.save}</span>}
                  </span>
                  <b>${r.price}</b>
                  <Link className="drow__go" href={shopHref} aria-label={`Pick ${selectedTier} strains`}>
                    →
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="fine center">Deals apply automatically in your cart when you add the matching flower.</p>
      </main>

      {/* ================= 3. DESKTOP RIGHT RAIL (Order Sidebar) ================= */}
      <ShopCartSidebar />

      <ShopStickyCartBar />
    </div>
  );
}
