"use client";

import * as React from "react";
import Link from "next/link";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";
import { ShopStickyCartBar } from "./shop-sticky-cart-bar";
import { FlowerTier, DEALS, WEIGHTS, inWakeWindow } from "@/lib/deals";

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
  "Exotic": {
    key: "Exotic",
    label: "Exotic",
    tagline: "Small-batch, hard-to-find strains, better by the ounce.",
  },
};

export function DealsView() {
  const [selectedTier, setSelectedTier] = React.useState<FlowerTier>("Midshelf");
  // DC-time Wake & Bake window, read after mount so server and client HTML match
  const [wakeOn, setWakeOn] = React.useState(false);
  React.useEffect(() => {
    const tick = () => setWakeOn(inWakeWindow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const TIER_ORDER: FlowerTier[] = ["Midshelf", "Topshelf", "Exotic"];
  const nextTier = TIER_ORDER[TIER_ORDER.indexOf(selectedTier) + 1];
  const lowestWake = Math.min(...TIER_ORDER.map((t) => DEALS[t].wake));
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

  // Markup mirrors the client deals.html + dealsPage() in site.js (2026-10-16 version)
  return (
    <div className="shell">
      <ShopSidebar activeCategory="deals" />

      <main className="shell__main">
        <section className="dealhead">
          <h1>Daily Deals</h1>
        </section>
        <div className="seglab">
          <span>3 tiers, same deals</span>
          <small>Pick your flower level</small>
        </div>
        <div className="seg seg--green seg--3" role="tablist" aria-label="Flower tier">
          {TIER_ORDER.map((tier) => (
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
        <span className="muted tiernote">{meta.tagline}</span>

        <div className={`wakebar ${wakeOn ? "is-on" : ""}`}>
          {wakeOn ? (
            <>
              <span>
                <b>Wake &amp; Bake is on</b>½ oz {selectedTier} for ${dealConfig.wake} · ends 12PM · limit 1
              </span>
              <Link href={shopHref}>Pick a strain</Link>
            </>
          ) : (
            <span>
              <b>Wake &amp; Bake</b>Daily 9AM to 12PM · ½ oz from ${lowestWake}
            </span>
          )}
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

        {nextTier && (
          <div className="nudge">
            <span>
              <b>Want something stronger?</b>
              <span>
                Same deals on {nextTier}, 2 half ounces for ${DEALS[nextTier].half[2]}.
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTier(nextTier);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              See {nextTier}
            </button>
          </div>
        )}

        <p className="fine center">Deals apply automatically in your cart when you add the matching flower.</p>
      </main>

      {/* ================= 3. DESKTOP RIGHT RAIL (Order Sidebar) ================= */}
      <ShopCartSidebar />

      <ShopStickyCartBar />
    </div>
  );
}
