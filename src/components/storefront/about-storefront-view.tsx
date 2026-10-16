"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

/** About page, generated from client-reference/about-us.html (markup kept 1:1 with the client site). */
export function AboutStorefrontView() {
  const { setFulfillment } = useCart();

  return (
    <main>
      <div className="narrow">
        <section className="phero phero--about">
          <div>
            <span className="eyebrow">ABOUT TORCH</span>
            <h1>DC&apos;s cannabis, done right.</h1>
            <p className="lead">
              Hand-picked products, real expertise and fast, discreet delivery from Downtown DC.
            </p>
          </div>
          <img src="/assets/img/flower.webp" alt="" />
        </section>
        <section className="prose">
          <h2>Our story</h2>
          <p>
            Torch started with a simple idea: buying cannabis in DC should feel easy, safe and welcoming. We
            hand-pick every strain, keep our menu organized by tier so you always know what you&apos;re
            getting, and train our team to help first-timers and connoisseurs alike.
          </p>
          <p>
            Today we serve neighborhoods across the District from our location at 1000 G St NW, with free
            delivery and curbside pickup seven days a week.
          </p>
        </section>
        <div className="values">
          <div className="value">
            <span className="value__ic">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7"></path>
              </svg>
            </span>
            <strong>Hand-picked</strong>
            <span>Every strain is chosen by our team.</span>
          </div>
          <div className="value">
            <span className="value__ic">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7"></path>
              </svg>
            </span>
            <strong>Real experts</strong>
            <span>Staff who help you find the right strain and dose.</span>
          </div>
          <div className="value">
            <span className="value__ic">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7"></path>
              </svg>
            </span>
            <strong>Discreet delivery</strong>
            <span>Free, fast and in unmarked packaging.</span>
          </div>
          <div className="value">
            <span className="value__ic">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7"></path>
              </svg>
            </span>
            <strong>Community</strong>
            <span>Education, workshops and local giving.</span>
          </div>
        </div>
        <section className="prose">
          <h2>Three tiers, zero guesswork</h2>
          <div className="tierrows">
            <Link className="tierrow" href="/flowers">
              <span>
                <strong>Midshelf</strong>
                <span>Quality picks, priced for value</span>
              </span>
              <span className="tier__c">7 strains</span>
            </Link>
            <Link className="tierrow" href="/flowers">
              <span>
                <strong>Topshelf</strong>
                <span>Our core lineup of classics</span>
              </span>
              <span className="tier__c">20+ strains</span>
            </Link>
            <Link className="tierrow" href="/flowers">
              <span>
                <strong>Private Reserve</strong>
                <span>Small-batch exotics</span>
              </span>
              <span className="tier__c">8 strains</span>
            </Link>
          </div>
        </section>
        <section className="ready">
          <strong>Ready when you are.</strong>
          <div className="orderbtns">
            <Link className="pill pill--green" href="/shop" onClick={() => setFulfillment("delivery")}>
              Delivery
            </Link>
            <Link className="pill pill--black" href="/shop" onClick={() => setFulfillment("pickup")}>
              Pickup
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
