import { LOCATION_PAGES, LOCATION_PAGE_BY_SLUG } from "@/lib/location-pages";
import { STATIC_PAGES, type StaticPageKey } from "@/lib/static-pages";
import { DEFAULT_HOME_COPY } from "@/lib/home-content";
import type { FaqItem } from "@/lib/page-html";

/**
 * Pages whose text can be edited on Admin › Pages, with the client's built-in copy (server only).
 */
export type EditablePage = {
  key: string;
  label: string;
  group: string;
  path: string;
  kind: "home" | "static" | "area";
};

const GROUP_OF = { DC: "Neighborhoods: Washington, DC", MD: "Neighborhoods: Maryland", VA: "Neighborhoods: Virginia" } as const;

const STATIC_LIST: { key: StaticPageKey; label: string; path: string }[] = [
  { key: "about", label: "About Us", path: "/about" },
  { key: "faq", label: "FAQ", path: "/faq" },
  { key: "terms", label: "Terms and Conditions", path: "/terms-conditions" },
  { key: "privacy", label: "Privacy Policy", path: "/privacy-policy" },
];

export const EDITABLE_PAGES: EditablePage[] = [
  { key: "home", label: "Homepage", group: "Main pages", path: "/", kind: "home" },
  ...STATIC_LIST.map((p) => ({ ...p, group: "Main pages", kind: "static" as const })),
  ...LOCATION_PAGES.map((p) => ({
    key: `area:${p.slug}`,
    label: p.name,
    group: p.kind === "area" && p.state ? GROUP_OF[p.state] : "Hotel & DC quadrant pages",
    path: `/${p.slug}`,
    kind: "area" as const,
  })),
];
export const EDITABLE_PAGE_BY_KEY: Record<string, EditablePage> = Object.fromEntries(EDITABLE_PAGES.map((p) => [p.key, p]));

/** The built-in copy of a page (what it shows when nothing is saved) */
export function builtInCopy(key: string): { body: string; chips: string[]; faq: FaqItem[] } | null {
  const page = EDITABLE_PAGE_BY_KEY[key];
  if (!page) return null;
  if (page.kind === "home") return { body: DEFAULT_HOME_COPY.introHtml, chips: DEFAULT_HOME_COPY.chips, faq: DEFAULT_HOME_COPY.faq };
  if (page.kind === "static") return { body: STATIC_PAGES[key as StaticPageKey].body, chips: [], faq: [] };
  return { body: LOCATION_PAGE_BY_SLUG[key.slice(5)].body, chips: [], faq: [] };
}

/** First-level URLs a new neighborhood page can't take (site pages and folders) */
const RESERVED = new Set([
  "admin", "api", "about", "account", "blog", "cart", "category", "checkout", "contact", "contact-us", "deals", "faq",
  "flowers", "login", "order-success", "privacy-policy", "product", "product-category", "shop", "terms-conditions",
  "track-order", "assets", "images", "sitemap.xml", "robots.txt", "store", "shop-now", "about-us", "cannabis-faq-dc",
]);

export function slugProblem(slug: string): string | null {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Use lowercase letters, numbers and hyphens only (e.g. cannabis-delivery-in-wheaton-md)";
  if (slug.length < 3 || slug.length > 100) return "The URL must be 3 to 100 characters";
  if (RESERVED.has(slug) || LOCATION_PAGE_BY_SLUG[slug]) return `/${slug} is already a page on the website`;
  return null;
}
