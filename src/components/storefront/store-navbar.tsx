"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cart-context";
import { AREAS_LIST } from "@/lib/areas-data";

// Same list and order as the client site (AREAS in its build.py)
const DC_NEIGHBORHOODS = AREAS_LIST.map((a) => ({ name: a.name, href: `/${a.slug}` }));

// Mobile menu, same order as the client site (Oct 22)
const MOBILE_LINKS = [
  { href: "/flowers", label: "Flower" },
  { href: "/product-category/pre-rolls", label: "Pre-rolls" },
  { href: "/product-category/disposables", label: "Disposables" },
  { href: "/product-category/concentrates", label: "Concentrates" },
  { href: "/product-category/edibles", label: "Edibles" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "FAQ" },
];

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function StoreNavbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { totalCount } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  React.useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("mnav-on");
    } else {
      document.body.classList.remove("mnav-on");
    }
    return () => {
      document.body.classList.remove("mnav-on");
    };
  }, [menuOpen]);

  return (
    <>
      <header className="header">
        <div className="header__in">
          {/* Mobile hamburger button */}
          <button
            className="iconbtn iconbtn--menu"
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link className="header__logo" href="/" aria-label="Torch home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/img/logo.webp"
              alt="Torch Cannabis Delivery"
            />
          </Link>

          {/* Desktop Search */}
          <form className="dsearch" role="search" onSubmit={handleSearch}>
            <label htmlFor="dq" className="sr-only">
              Search the menu
            </label>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4F5A50"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="dq"
              name="q"
              type="search"
              placeholder="What are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Desktop Nav */}
          <nav className="dnav" aria-label="Main">
            <Link href="/shop">Shop</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            {session?.user && (
              <Link href="/account" title="My Account">
                Account
              </Link>
            )}
          </nav>

          {/* Desktop call icon (client site shows no written number in the header) */}
          <a className="dphone" href="tel:+12024681966" aria-label="Call Torch">
            <span className="dphone__ic">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </span>
          </a>

          {/* Header Right (Call & Cart buttons on Mobile) */}
          <span className="header__right">
            <a
              className="iconbtn iconbtn--call"
              href="tel:+12024681966"
              aria-label="Call Torch"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </a>
            <Link className="iconbtn iconbtn--cart" href="/cart" aria-label="Cart">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6" />
              </svg>
              <span className={`badge ${totalCount > 0 ? "is-on" : ""}`}>
                {totalCount}
              </span>
            </Link>
          </span>
        </div>
      </header>

      {/* Slide-in Mobile Drawer */}
      <div className="mnav" hidden={!menuOpen}>
        <div className="mnav__bg" onClick={() => setMenuOpen(false)} />
        <aside className="mnav__panel" aria-label="Menu">
          <div className="mnav__top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/img/logo.webp"
              alt="Torch"
              height={34}
              style={{ height: "34px", width: "auto" }}
            />
            <button
              className="mnav__x"
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="mnav__links">
            {/* Client site order: every category, then Deals, About Us, Contact Us, FAQ */}
            {MOBILE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
                {l.label}
                <Chevron />
              </Link>
            ))}

            {session?.user ? (
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                My Account
                <Chevron />
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Sign in / Account
                <Chevron />
              </Link>
            )}

            <details className="mnav__acc">
              <summary>
                Neighborhoods
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="mnav__areas">
                {DC_NEIGHBORHOODS.map((area) => (
                  <Link
                    key={area.name}
                    href={area.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                    {area.name}
                  </Link>
                ))}
              </div>
            </details>
          </nav>

          <a className="mnav__call" href="tel:+12024681966" aria-label="Call Torch">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
            </svg>
            Call us
          </a>
        </aside>
      </div>
    </>
  );
}
