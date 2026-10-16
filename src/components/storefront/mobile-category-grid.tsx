"use client";

import * as React from "react";
import Link from "next/link";

const CATEGORIES = [
  {
    name: "Flowers",
    slug: "flowers",
    href: "/flowers",
    image: "/assets/img/flower.webp",
  },
  {
    name: "Pre-rolls",
    slug: "pre-rolls",
    href: "/shop?category=pre-rolls",
    image: "/assets/img/preroll.webp",
  },
  {
    name: "Disposables",
    slug: "disposables",
    href: "/shop?category=disposables",
    image: "/assets/img/disposable.webp",
  },
  {
    name: "Concentrates",
    slug: "concentrates",
    href: "/shop?category=concentrates",
    image: "/assets/img/concentrate.webp",
  },
  {
    name: "Edibles",
    slug: "edibles",
    href: "/shop?category=edibles",
    image: "/assets/img/edible.webp",
  },
  {
    name: "Mushrooms",
    slug: "mushrooms",
    href: "/shop?category=mushrooms",
    image: "/assets/img/mushroom.webp",
  },
];

export function MobileCategoryGrid() {
  return (
    <section className="sec lg:hidden" aria-labelledby="cats-h">
      <div className="sec__head">
        <h2 id="cats-h">Shop By Category</h2>
        <Link href="/shop">Browse all</Link>
      </div>

      <div className="cats">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} className="cat" href={cat.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.image}
              alt={cat.name}
              width={76}
              height={76}
              loading="lazy"
            />
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
