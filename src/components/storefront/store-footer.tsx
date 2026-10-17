"use client";

import * as React from "react";
import Link from "next/link";
import { AREAS_LIST } from "@/lib/areas-data";

// Same list and order as the client site (AREAS in its build.py)
const DC_NEIGHBORHOODS = AREAS_LIST.map((a) => ({ name: a.name, href: `/${a.slug}` }));

export function StoreFooter() {
  return (
    <footer className="footer">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span className="footer__lead">
          Order online or by phone for free delivery or curbside pickup.
        </span>

        <a className="footer__line" href="tel:+12024681966">
          <span className="footer__ic">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
          </span>
          (202) 468-1966
        </a>

        <a
          className="footer__line"
          href="https://maps.google.com/?q=1000+G+St+NW,+Washington,+DC+20001"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="footer__ic">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          1000 G St NW, Washington, DC 20001
        </a>

        <a className="footer__line" href="mailto:info@torchdc.co">
          <span className="footer__ic">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </span>
          info@torchdc.co
        </a>

        <span className="footer__line">
          <span className="footer__ic">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          Mon to Sat 7AM to 11PM · Sun 10AM to 9PM
        </span>
      </div>

      <div className="footer__cols">
        <div>
          <h3>Shop</h3>
          <Link href="/flowers">Flowers</Link>
          <Link href="/shop?category=pre-rolls">Pre-rolls</Link>
          <Link href="/shop?category=disposables">Disposables</Link>
          <Link href="/shop?category=concentrates">Concentrates</Link>
          <Link href="/shop?category=edibles">Edibles</Link>
          <Link href="/shop?category=mushrooms">Mushrooms</Link>
        </div>

        <div>
          <h3>Company</h3>
          <Link href="/about">About Us</Link>
          <Link href="/deals">Deals</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/terms-conditions">Terms and Conditions</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/track-order">Track Order</Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3>Neighborhoods</h3>
        <div className="areas">
          {DC_NEIGHBORHOODS.map((hood) => (
            <Link key={hood.name} href={hood.href}>
              {hood.name}
            </Link>
          ))}
        </div>

        <div className="social">
          <a
            href="https://www.instagram.com/torch.dc/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/Torch-Dispensary"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
            </svg>
          </a>
          <a
            href="https://x.com/torchdcusa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 4l16 16M20 4L4 20" />
            </svg>
          </a>
        </div>

        <span className="legal">
          © 2026 Torch · 1000 G St NW, Washington, DC 20001 · (202) 468-1966 · For adults 21+ only.
        </span>
      </div>
    </footer>
  );
}
