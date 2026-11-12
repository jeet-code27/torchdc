import { ALL_LOCATION_SLUGS } from "@/lib/location-groups";

/** body[data-page] values, same as the client site; its CSS has page-specific rules keyed on them. */
export const STATIC_PAGES: Record<string, string> = {
  "/": "home",
  "/shop": "shop",
  "/flowers": "flowers",
  "/deals": "deals",
  "/cart": "cart",
  "/about": "about",
  "/contact": "contact",
  "/contact-us": "contact",
  "/faq": "faq",
  "/privacy-policy": "legal",
  "/terms-conditions": "legal",
  "/blog": "blog",
  // DC quadrant hubs and the hotel page (client site, Nov 10)
  "/weed-delivery-northwest-dc": "quad",
  "/weed-delivery-northeast-dc": "quad",
  "/weed-delivery-southeast-dc": "quad",
  "/weed-delivery-southwest-dc": "quad",
  "/cannabis-delivery-to-dc-hotels": "hotels",
};

// All neighborhood pages (DC, Maryland, Virginia)
const AREA_SLUGS = [...ALL_LOCATION_SLUGS];

export function pageKey(pathname: string, extraAreaSlugs: string[] = []): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (STATIC_PAGES[path]) return STATIC_PAGES[path];
  if (path.startsWith("/product-category/")) return "shop";
  if (path.startsWith("/product/")) return "product";
  const slug = path.replace(/^\//, "");
  if (AREA_SLUGS.includes(slug) || extraAreaSlugs.includes(slug)) return "area";
  return null;
}

/**
 * Inline script that sets body[data-page] before the first paint, so page-specific CSS (for example
 * hiding the mobile Best Sellers rail on desktop) applies immediately instead of after hydration.
 */
export function pageKeyInlineScript(extraAreaSlugs: string[] = []): string {
  // "<" escaped so a slug can never close the script tag
  const areas = JSON.stringify([...AREA_SLUGS, ...extraAreaSlugs]).replace(/</g, "\\u003c");
  return `(function(){try{var S=${JSON.stringify(STATIC_PAGES)},A=${areas};var p=location.pathname;if(p.length>1)p=p.replace(/\\/+$/,"");var k=S[p]||(p.indexOf("/product-category/")===0?"shop":p.indexOf("/product/")===0?"product":A.indexOf(p.slice(1))>-1?"area":null);if(k)document.body.setAttribute("data-page",k);}catch(e){}})();`;
}
