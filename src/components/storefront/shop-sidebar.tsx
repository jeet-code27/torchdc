"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname } from "next/navigation";

export interface CategoryOption {
  slug: string;
  name: string;
  isDeals?: boolean;
}

export const STORE_CATEGORIES: CategoryOption[] = [
  { slug: "best", name: "Best Sellers" },
  { slug: "new", name: "New Arrivals" },
  { slug: "flowers", name: "Flowers" },
  { slug: "pre-rolls", name: "Pre-rolls" },
  { slug: "disposables", name: "Disposables" },
  { slug: "concentrates", name: "Concentrates" },
  { slug: "edibles", name: "Edibles" },
  { slug: "mushrooms", name: "Mushrooms" },
  { slug: "deals", name: "Deals", isDeals: true },
];

interface ShopSidebarProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
  scrollLinks?: boolean;
}

export function ShopSidebar({
  activeCategory = "best",
  onSelectCategory,
  scrollLinks = false,
}: ShopSidebarProps) {
  const pathname = usePathname();
  const [currentActive, setCurrentActive] = React.useState(activeCategory);

  React.useEffect(() => {
    setCurrentActive(activeCategory);
  }, [activeCategory]);

  // If on homepage with scrollLinks, track active section on scroll
  React.useEffect(() => {
    if (!scrollLinks) return;

    const sections = STORE_CATEGORIES.filter((c) => !c.isDeals).map((c) =>
      document.getElementById(c.slug)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => observer.disconnect();
  }, [scrollLinks]);

  const handleClick = (e: React.MouseEvent, cat: CategoryOption) => {
    if (cat.isDeals) return; // follow regular link to /deals
    if (cat.slug === "flowers") return; // always navigate directly to /flowers page!

    if (onSelectCategory) {
      e.preventDefault();
      setCurrentActive(cat.slug);
      onSelectCategory(cat.slug);
      return;
    }

    if (scrollLinks) {
      e.preventDefault();
      const target = document.getElementById(cat.slug);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setCurrentActive(cat.slug);
      }
    }
  };

  return (
    <aside className="dside" aria-label="Menu">
      <span className="dside__h">MENU</span>
      {STORE_CATEGORIES.map((cat) => {
        const isDeals = cat.isDeals;
        const href = isDeals
          ? "/deals"
          : scrollLinks
          ? `#${cat.slug}`
          : cat.slug === "flowers"
          ? "/flowers"
          : `/shop?category=${cat.slug}`;

        const isActive = isDeals
          ? pathname === "/deals"
          : currentActive === cat.slug && pathname !== "/deals";

        return (
          <Link
            key={cat.slug}
            href={href}
            onClick={(e) => handleClick(e, cat)}
            className={`dside__a ${isDeals ? "dside__deals" : ""} ${
              isActive ? "is-on" : ""
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </aside>
  );
}
