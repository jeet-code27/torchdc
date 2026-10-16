"use client";

import * as React from "react";
import Link from "next/link";
import { AreaInfo, AREA_URL_MAP } from "@/lib/areas-data";
import { ShopProduct, ShopProductCard } from "./shop-product-card";
import { useCart } from "@/context/cart-context";

interface AreaPageViewProps {
  area: AreaInfo;
  popularProducts: ShopProduct[];
}

const TickIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export function AreaPageView({ area, popularProducts }: AreaPageViewProps) {
  const { setFulfillment } = useCart();
  const at = area.name.endsWith("Street") ? "on" : "in";
  const nameWidth = Math.round(area.name.length * 7.2 + 22);

  const faqs = [
    {
      q: `How does delivery to ${area.name} work?`,
      a: "Order online or by phone and we text you a delivery window once your order is confirmed.",
    },
    {
      q: `Is delivery free ${at} ${area.name}?`,
      a: `Yes. Delivery is free on every order across Washington, DC, including all of ${area.name}.`,
    },
    {
      q: "How do I pay?",
      a: "Cash on delivery. Pay your driver in cash when your order arrives.",
    },
    {
      q: "What do I need when my order arrives?",
      a: "A valid government-issued photo ID showing you are 21 or older. Our driver checks it at the door.",
    },
  ];

  return (
    // Markup mirrors the client area pages (e.g. client-reference/adams-morgan-weed-delivery-dc.html)
    <main>
      <div className="narrow">
        <span className="crumbs">
          <Link href="/">Home</Link> / Delivery Areas / {area.name}
        </span>

        {/* Area Hero Card */}
        <section className="ahero">
          <div className="ahero__map">
            <svg
              viewBox="0 0 360 200"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label={`Delivery route from Torch to ${area.name}`}
            >
              <rect width="360" height="200" fill="#E3EEE2" />
              <path
                d="M-10 70 Q120 52 370 88"
                stroke="#FFFFFF"
                strokeWidth="10"
                fill="none"
              />
              <path
                d="M-10 128 Q160 112 370 138"
                stroke="#FFFFFF"
                strokeWidth="8"
                fill="none"
              />
              <path d="M90 -10 L120 210" stroke="#FFFFFF" strokeWidth="8" />
              <path d="M230 -10 L210 210" stroke="#FFFFFF" strokeWidth="10" />
              <path d="M300 -10 L320 210" stroke="#FFFFFF" strokeWidth="6" />
              <path d="M30 -10 L20 210" stroke="#FFFFFF" strokeWidth="5" />
              <ellipse cx="165" cy="100" rx="30" ry="18" fill="#C5DCC3" />
              <ellipse cx="275" cy="60" rx="22" ry="13" fill="#C5DCC3" />
              <ellipse cx="60" cy="150" rx="20" ry="12" fill="#C5DCC3" />
              <path
                d="M238 140 C222 118 196 120 178 104 S146 92 124 92"
                stroke="#E8561E"
                strokeWidth="3"
                strokeDasharray="2 7"
                strokeLinecap="round"
                fill="none"
              />
              <g transform="translate(110 54)">
                <path
                  d="M14 0C6.3 0 0 6.1 0 13.7 0 24 14 38 14 38s14-14 14-24.3C28 6.1 21.7 0 14 0z"
                  fill="#E8561E"
                />
                <circle cx="14" cy="13.5" r="5" fill="#FFFFFF" />
              </g>
              <rect
                x="142"
                y="58"
                rx="11"
                width={nameWidth}
                height="22"
                fill="#FFFFFF"
              />
              <text
                x={142 + nameWidth / 2}
                y="73"
                textAnchor="middle"
                fontFamily="Inter,Arial,sans-serif"
                fontSize="11.5"
                fontWeight="700"
                fill="#2F4F30"
              >
                {area.name}
              </text>
              <circle
                cx="238"
                cy="140"
                r="13"
                fill="#5A805B"
                stroke="#FFFFFF"
                strokeWidth="3"
              />
              <path
                d="M238 132c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-5 1-8z"
                fill="#FFFFFF"
              />
              <rect
                x="172"
                y="132"
                rx="10"
                width="52"
                height="20"
                fill="#FFFFFF"
              />
              <text
                x="198"
                y="146"
                textAnchor="middle"
                fontFamily="Inter,Arial,sans-serif"
                fontSize="10.5"
                fontWeight="700"
                fill="#2F4F30"
              >
                Torch
              </text>
            </svg>
          </div>

          <div className="ahero__txt">
            <span className="ahero__eye">DELIVERY AREA · WASHINGTON, DC</span>
            <h1>
              Cannabis Delivery {at} {area.name}
            </h1>
            <p>Free same-day delivery, {area.span}.</p>

            <ul className="ahero__chips">
              <li>
                <TickIcon />
                Free delivery
              </li>
              <li>
                <TickIcon />
                Discreet packaging
              </li>
              <li>
                <TickIcon />
                21+ ID at the door
              </li>
              <li>
                <TickIcon />
                Cash on delivery
              </li>
            </ul>
          </div>
        </section>

        {/* Order CTA Buttons */}
        <div className="orderbtns">
          <Link
            className="pill pill--green"
            href="/shop"
            onClick={() => setFulfillment("delivery")}
          >
            Delivery
          </Link>
          <Link
            className="pill pill--black"
            href="/shop"
            onClick={() => setFulfillment("pickup")}
          >
            Pickup
          </Link>
        </div>

        {/* Popular in Area Products Rail */}
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

        {/* How it works steps */}
        <section className="asteps">
          <h2>How it works</h2>
          <ol>
            <li>
              <span className="asteps__n">1</span>
              <span>
                <strong>Order online or call</strong>
                <span>Pick your products here or call (202) 468-1966.</span>
              </span>
            </li>
            <li>
              <span className="asteps__n">2</span>
              <span>
                <strong>We text your window</strong>
                <span>You get a text when your driver is on the way.</span>
              </span>
            </li>
            <li>
              <span className="asteps__n">3</span>
              <span>
                <strong>Show ID, pay cash</strong>
                <span>21+ photo ID at the door. Cash only.</span>
              </span>
            </li>
          </ol>
        </section>

        {/* Your local delivery service prose */}
        <section className="prose">
          <h2>Your local delivery service</h2>
          <p>
            {area.para} Order in a few taps or call, and we&apos;ll text you
            when your order is on the way.
          </p>

          <ul className="ticks">
            <li>Free delivery on every order</li>
            <li>Three flower tiers: Midshelf, Topshelf and Private Reserve</li>
            <li>Wake &amp; Bake half ounce deal, 9AM to 12PM</li>
            <li>Unmarked bags, 21+ ID check</li>
            <li>Pay cash at the door</li>
          </ul>
        </section>

        {/* Area FAQ */}
        <section className="faq" id="faq" aria-labelledby="area-faq-h">
          <h2 id="area-faq-h">{area.name} FAQ</h2>
          {faqs.map((f, i) => (
            <details key={i}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        {/* Nearby neighborhoods */}
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
