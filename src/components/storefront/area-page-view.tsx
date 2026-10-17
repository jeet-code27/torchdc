"use client";

import * as React from "react";
import Link from "next/link";
import { AreaInfo, AREA_URL_MAP } from "@/lib/areas-data";
import { ShopProduct, ShopProductCard } from "./shop-product-card";
import { DeliverySteps } from "./delivery-steps";
import { useCart } from "@/context/cart-context";

interface AreaPageViewProps {
  area: AreaInfo;
  popularProducts: ShopProduct[];
}

const AREA_CHIPS = ["Free Delivery", "Discreet Packaging", "Cash On Delivery"];

/** Drawn map with the neighborhood pin and a driver on the way (area_map() in the client build.py). */
function AreaMap({ name }: { name: string }) {
  const w = Math.round(name.length * 7.2 + 22);
  return (
    <svg
      viewBox="0 0 360 200"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Torch driver on the way to ${name}`}
    >
      <rect width="360" height="200" fill="#E3EEE2" />
      <path d="M-10 70 Q120 52 370 88" stroke="#FFFFFF" strokeWidth="10" fill="none" />
      <path d="M-10 128 Q160 112 370 138" stroke="#FFFFFF" strokeWidth="8" fill="none" />
      <path d="M90 -10 L120 210" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M230 -10 L210 210" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M300 -10 L320 210" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M30 -10 L20 210" stroke="#FFFFFF" strokeWidth="5" />
      <ellipse cx="165" cy="100" rx="30" ry="18" fill="#C5DCC3" />
      <ellipse cx="275" cy="60" rx="22" ry="13" fill="#C5DCC3" />
      <ellipse cx="60" cy="150" rx="20" ry="12" fill="#C5DCC3" />
      <path
        d="M390 150 C330 146 290 146 240 132 S170 100 124 92"
        stroke="#E8561E"
        strokeWidth="3"
        strokeDasharray="2 7"
        strokeLinecap="round"
        fill="none"
      />
      <g transform="translate(108 52)">
        <path d="M14 0C6.3 0 0 6.1 0 13.7 0 24 14 38 14 38s14-14 14-24.3C28 6.1 21.7 0 14 0z" fill="#E8561E" />
        <circle cx="14" cy="13.5" r="5" fill="#FFFFFF" />
      </g>
      <rect x="140" y="58" rx="11" width={w} height="22" fill="#FFFFFF" />
      <text
        x={Math.round(140 + w / 2)}
        y="73"
        textAnchor="middle"
        fontFamily="Inter,Arial,sans-serif"
        fontSize="11.5"
        fontWeight="700"
        fill="#2F4F30"
      >
        {name}
      </text>
      <g transform="translate(240 132)">
        <circle r="15" fill="#2F4F30" stroke="#FFFFFF" strokeWidth="3" />
        <g
          transform="translate(-8 -7) scale(.68)"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 6h13v10H1zM14 9h4l4 4v3h-8z" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
        </g>
      </g>
      <rect x="104" y="128" rx="11" width="112" height="22" fill="#2F4F30" />
      <text
        x="160"
        y="143"
        textAnchor="middle"
        fontFamily="Inter,Arial,sans-serif"
        fontSize="10.5"
        fontWeight="700"
        fill="#FFFFFF"
      >
        Driver on the way
      </text>
    </svg>
  );
}

/** Neighborhood page; markup mirrors build_areas() in the client build.py (2026-10-16). */
export function AreaPageView({ area, popularProducts }: AreaPageViewProps) {
  const { setFulfillment } = useCart();
  const at = area.name.endsWith("Street") ? "on" : "in";

  const faqs = [
    {
      q: `How does delivery to ${area.name} work?`,
      a: "Order online or by phone and we text you a delivery window once your order is confirmed.",
    },
    {
      q: `Is delivery free ${at} ${area.name}?`,
      a: `Yes. Delivery is free on every order across Washington, DC, including all of ${area.name}.`,
    },
    { q: "How do I pay?", a: "Cash on delivery once your driver arrives." },
    {
      q: "What do I need when my order arrives?",
      a: "We'll text you when your driver is outside. Step out, pay cash and grab your order.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="narrow">
        <span className="crumbs">
          <Link href="/">Home</Link> / Neighborhoods / {area.name}
        </span>

        <section className="ahero">
          <div className="ahero__map">
            <AreaMap name={area.name} />
          </div>
          <div className="ahero__txt">
            <span className="ahero__eye">NEIGHBORHOOD · WASHINGTON, DC</span>
            <h1>
              Cannabis Delivery {at} {area.name}
            </h1>
            <p>Free same-day delivery, {area.span}.</p>
            <ul className="ahero__chips">
              {AREA_CHIPS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="orderbtns">
          <Link className="pill pill--green" href="/shop" onClick={() => setFulfillment("delivery")}>
            Delivery
          </Link>
          <Link className="pill pill--black" href="/shop" onClick={() => setFulfillment("pickup")}>
            Pickup
          </Link>
        </div>

        {popularProducts.length > 0 && (
          <>
            <section className="sec">
              <div className="sec__head">
                <h2>
                  Popular {at} {area.name}
                </h2>
                <Link href="/shop">Shop all</Link>
              </div>
            </section>
            <div className="rail">
              {popularProducts.slice(0, 8).map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}

        <DeliverySteps />

        <section className="prose">
          <h2>Your local delivery service</h2>
          <p>
            {area.para} Order in a few taps or call, and we&apos;ll text you when your order is on the way.
          </p>
          <ul className="ticks">
            <li>Free delivery on every order</li>
            <li>Three flower tiers: Midshelf, Topshelf and Exotic</li>
            <li>Wake &amp; Bake half ounce deal, 9AM to 12PM</li>
            <li>Unmarked, discreet bags</li>
            <li>Cash on delivery</li>
          </ul>
        </section>

        <section className="faq" id="faq" aria-labelledby="area-faq-h">
          <h2 id="area-faq-h">{area.name} FAQ</h2>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="prose">
          <h2>Nearby neighborhoods</h2>
          <div className="nearby">
            {area.nearby.map((n) => {
              const url = AREA_URL_MAP[n];
              return url ? (
                <Link key={n} href={url}>
                  {n}
                </Link>
              ) : (
                <span key={n}>{n}</span>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
