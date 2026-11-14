/**
 * "Order now" links at the end of blog posts (content spec 8.1 / 8.2). Browser-safe.
 */
export const SAME_DAY_PATH = "/same-day-cannabis-delivery-washington-dc";

export const SHOP_CATEGORIES: { slug: string; label: string; href: string }[] = [
  { slug: "flowers", label: "Flower", href: "/flowers" },
  { slug: "pre-rolls", label: "Pre-rolls", href: "/product-category/pre-rolls" },
  { slug: "disposables", label: "Disposables", href: "/product-category/disposables" },
  { slug: "cartridges", label: "Cartridges", href: "/product-category/cartridges" },
  { slug: "concentrates", label: "Concentrates", href: "/product-category/concentrates" },
  { slug: "edibles", label: "Edibles", href: "/product-category/edibles" },
];

/** "" = picked from the title, "all" = Flower, Pre-rolls, Disposables, Edibles, "none" = no links */
export const SHOP_LINKS = ["", "all", "none", ...SHOP_CATEGORIES.map((c) => c.slug)];

const ALL = ["flowers", "pre-rolls", "disposables", "edibles"];

/** The category a post is about, from its title (gummies -> Edibles, strains -> Flower, ...) */
function fromTitle(title: string): string[] {
  const t = title.toLowerCase();
  if (/gumm|edible|chocolate/.test(t)) return ["edibles"];
  if (/pre-?roll|joint/.test(t)) return ["pre-rolls"];
  if (/\bcarts?\b|cartridge|510/.test(t)) return ["cartridges"];
  if (/disposable|vape|vaps|pen\b/.test(t)) return ["disposables"];
  if (/concentrate|wax|dab|rosin|shatter/.test(t)) return ["concentrates"];
  if (/strain|sativa|indica|hybrid|flower|bud|ounce|eighth|terpene|kush/.test(t)) return ["flowers"];
  return ALL;
}

export function postShopLinks(setting: string | undefined, title: string) {
  if (setting === "none") return [];
  const slugs = setting === "all" ? ALL : setting ? [setting] : fromTitle(title);
  return SHOP_CATEGORIES.filter((c) => slugs.includes(c.slug));
}
