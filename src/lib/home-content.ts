import { LOCATION_GROUPS, type LocationState } from "@/lib/location-groups";
import type { Faq } from "@/lib/category-content";

/**
 * Homepage copy from the client site (src/home_about_faq.html; Oct 25 content update + Nov 10 keyword copy).
 * Word for word. Answers may contain links. Browser-safe.
 */

export const HOME_H1 = "Washington DC Weed Delivery & Cannabis Dispensary";
export const HOME_PARAGRAPHS = [
  "Torch delivers cannabis across Washington DC, Maryland and Virginia in 30 to 90 minutes, every day from 7AM to 11PM. Delivery is free in DC and starts at $20 in Maryland and Virginia. Pay cash on delivery. You must be 21+ with a valid photo ID. Order online or call (202) 468-1966.",
  "Order weed online from our Downtown DC dispensary for same-day delivery: flower, pre-rolls, THC disposables and edibles, with late-night orders until 11PM.",
];
export const HOME_FACT_CHIPS = [
  "30 to 90 minute delivery",
  "7AM to 11PM daily",
  "Free delivery in DC",
  "MD and VA from $20",
  "Cash on delivery",
  "21+ with photo ID",
];

/** "Downtown, Adams Morgan, … and Ivy City" with links (client build.py hood_links()) */
function hoodLinks(state: LocationState) {
  const links = LOCATION_GROUPS[state].map((a) => `<a href="/${a.slug}">${a.name}</a>`);
  return `${links.slice(0, -1).join(", ")} and ${links[links.length - 1]}`;
}

export const HOME_FAQ: Faq[] = [
  { q: "What are your hours?", a: "We're open 7 days a week, 7AM to 11PM, for delivery and curbside pickup. We take orders until 11PM." },
  {
    q: "Where are you located?",
    a: "Torch is a Downtown DC cannabis dispensary offering delivery across DC, Maryland and Virginia, plus curbside pickup. No walk-ins: order online or call (202) 468-1966.",
  },
  { q: "How do I pay?", a: "Cash on delivery. Our drivers don't carry change, so please have exact cash ready." },
  {
    q: "Is delivery free?",
    a: "Delivery is free anywhere in DC. In Maryland and Virginia, it's $20 inside the Beltway or within 2 miles outside it, and $40 farther out.",
  },
  { q: "How fast is delivery?", a: "Most orders arrive in 30 to 90 minutes after your ID is verified, depending on traffic." },
  {
    q: "Do you deliver to hotels?",
    a: 'Yes. Torch delivers to hotels in DC, Maryland and Virginia. See our <a href="/weed-delivery-to-dc-hotel">hotel delivery guide</a>.',
  },
  {
    q: "Do you deliver to Maryland and Virginia?",
    a: "Yes. Torch delivers to Maryland and Virginia up to 25 miles from DC. Delivery is $20 inside the Beltway or within 2 miles outside it, and $40 farther out. More than 25 miles away? Call or text (202) 468-1966 before ordering.",
  },
  {
    q: "What products do you carry?",
    a: "Flower in three tiers (Midshelf, Topshelf and Exotic), pre-rolls, THC disposables, cartridges, concentrates and edibles. Browse the categories above to see the full menu.",
  },
  {
    q: "Is there a first-order discount?",
    a: "First orders usually come with a free pre-roll or two, depending on availability. Text us at (202) 468-1966 to ask.",
  },
  {
    q: "Which neighborhoods do you deliver to?",
    a: `All of Washington, DC, plus Maryland and Virginia up to 25 miles from DC. DC neighborhoods include ${hoodLinks("DC")}. In Maryland we deliver to ${hoodLinks("MD")}, and in Virginia to ${hoodLinks("VA")}.`,
  },
  {
    q: "How old do I need to be?",
    a: "You must be 21 or older with a valid government-issued photo ID, verified by text before your order is confirmed.",
  },
  { q: "Can visitors from out of state order?", a: "Yes. Adults 21+ with a valid government-issued photo ID from any state can order." },
  {
    q: "Is Torch a marijuana dispensary?",
    a: "Yes. Torch is a Downtown DC marijuana dispensary with same-day weed delivery across DC, Maryland and Virginia, plus curbside pickup. There's no walk-in shopping: order online or call (202) 468-1966.",
  },
  {
    q: "Can I visit your weed shop?",
    a: "Torch is a cannabis store with delivery and curbside pickup only, so there's no walk-in shopping. Order online and we'll bring it to you, or pick up curbside.",
  },
  { q: "How much weed can you have in DC?", a: "Adults 21+ can have up to 2 ounces of weed in DC." },
];

/** The intro under the banner as HTML (what Admin › Pages starts from) */
export const HOME_INTRO_HTML = HOME_PARAGRAPHS.map((p) => `<p>${p}</p>`).join("\n");

/** Homepage copy as the page shows it: saved on Admin › Pages, else the client's */
export type HomeCopy = { h1: string; introHtml: string; chips: string[]; faq: Faq[] };
export const DEFAULT_HOME_COPY: HomeCopy = { h1: HOME_H1, introHtml: HOME_INTRO_HTML, chips: HOME_FACT_CHIPS, faq: HOME_FAQ };
