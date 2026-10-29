import { AREAS_LIST } from "@/lib/areas-data";

/**
 * Pages whose search title / description can be changed on Admin › SEO.
 * title/description here are the built-in defaults (used when nothing is set in the admin).
 */
export type SeoPage = { key: string; path: string; label: string; group: "Main pages" | "Neighborhoods"; title: string; description: string };

const MAIN: SeoPage[] = [
  {
    key: "home",
    path: "/",
    label: "Homepage",
    group: "Main pages",
    title: "Weed Delivery in Washington, DC | Torch Cannabis Delivery",
    description:
      "Torch delivers flower, pre-rolls, vapes, concentrates and edibles across Washington, DC. Free delivery, pay cash on delivery. 21+ only.",
  },
  {
    key: "shop",
    path: "/shop",
    label: "Shop",
    group: "Main pages",
    title: "Shop Cannabis Online in DC | Torch Cannabis Delivery",
    description:
      "Shop flower, pre-rolls, disposables, concentrates and edibles for free delivery across Washington, DC. Pay cash on delivery.",
  },
  {
    key: "flowers",
    path: "/flowers",
    label: "Flower",
    group: "Main pages",
    title: "Cannabis Flower Delivery in DC | Midshelf, Topshelf, Exotic | Torch",
    description:
      "Hand-picked cannabis flower in three tiers: Midshelf, Topshelf and Exotic. Free same-day delivery across Washington, DC.",
  },
  {
    key: "deals",
    path: "/deals",
    label: "Deals",
    group: "Main pages",
    title: "Cannabis Deals in DC | Bundle Deal, Stack & Save | Torch",
    description:
      "Bulk flower deals on Midshelf, Topshelf and Exotic: Bundle Deals on half ounces, Stack & Save ounces and the Half-Pound Haul. Free DC delivery.",
  },
  {
    key: "about",
    path: "/about",
    label: "About Us",
    group: "Main pages",
    title: "About Torch | Cannabis Delivery in Washington, DC",
    description:
      "Torch is a Downtown DC cannabis delivery service with hand-picked flower, real expertise and free, discreet delivery across the District.",
  },
  {
    key: "contact",
    path: "/contact-us",
    label: "Contact Us",
    group: "Main pages",
    title: "Contact Torch | Cannabis Delivery in Washington, DC",
    description: "Call, text or email Torch. 1000 G St NW, Washington, DC 20001. Open 7 days a week, 7AM to 11PM.",
  },
  {
    key: "faq",
    path: "/faq",
    label: "FAQ",
    group: "Main pages",
    title: "Cannabis FAQ for Washington, DC | Torch Cannabis Delivery",
    description:
      "Answers about Torch hours, cash on delivery, ID, deals, flower tiers and DC cannabis law. Free same-day cannabis delivery across Washington, DC.",
  },
  {
    key: "blog",
    path: "/blog",
    label: "Blog",
    group: "Main pages",
    title: "Cannabis Blog | Torch Cannabis Delivery",
    description:
      "Guides to cannabis in Washington, DC from Torch: strains, flower tiers, deals, delivery tips and neighborhood guides for adults 21+.",
  },
  {
    key: "privacy",
    path: "/privacy-policy",
    label: "Privacy Policy",
    group: "Main pages",
    title: "Privacy Policy | Torch",
    description:
      "How Torch collects and uses your name, phone and address to fill orders in Washington, DC. We never sell your information.",
  },
  {
    key: "terms",
    path: "/terms-conditions",
    label: "Terms and Conditions",
    group: "Main pages",
    title: "Terms and Conditions | Torch",
    description:
      "Terms for ordering from Torch: 21+ only, cash on delivery, delivery within Washington, DC, deals and responsible use.",
  },
];

const AREAS: SeoPage[] = AREAS_LIST.map((area) => {
  const at = area.name.endsWith("Street") ? "on" : "in";
  return {
    key: `area:${area.slug}`,
    path: `/${area.slug}`,
    label: area.name,
    group: "Neighborhoods",
    title: `Weed Delivery ${at} ${area.name}, DC | Torch Cannabis Delivery`,
    description: `Free same-day cannabis delivery ${at} ${area.name}, Washington, DC. Flower, pre-rolls, vapes and edibles. Cash on delivery, 21+ only.`,
  };
});

export const SEO_PAGES: SeoPage[] = [...MAIN, ...AREAS];
export const SEO_PAGE_BY_KEY: Record<string, SeoPage> = Object.fromEntries(SEO_PAGES.map((p) => [p.key, p]));
