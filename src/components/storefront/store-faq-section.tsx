"use client";

import * as React from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What are the operating hours of Torch cannabis dispensary in Downtown Washington, DC?",
    answer:
      "Torch is open 7 days a week from 7:00 AM to 12:00 AM (midnight). Whether you’re in Penn Quarter, Chinatown, or Capitol Hill, or visiting nearby attractions like the National Mall or the White House, you can stop by our Downtown DC dispensary during these hours to shop our premium cannabis menu.",
  },
  {
    question: "How can I find Torch dispensary in Washington, DC?",
    answer:
      "Torch is centrally located in Downtown Washington, DC at 1000 G St NW, just minutes from Capital One Arena, the Walter E. Washington Convention Center, and the Smithsonian Museums. Simply search “Torch cannabis dispensary near me” or “weed dispensary in Downtown DC” on Google Maps. You can also visit our website for exact address and directions.",
  },
  {
    question: "What types of cannabis products does Torch carry?",
    answer:
      "Torch offers one of the most diverse cannabis menus in the DC metro area. Our Downtown dispensary features premium flower strains, pre-rolls, concentrates, edibles, tinctures, topicals, vape cartridges, CBD selections, and a curated range of cannabis accessories. Whether you’re staying near the National Mall, attending a concert at Capital One Arena, or exploring Dupont Circle or Shaw, Torch has high-quality cannabis products to fit your needs.",
  },
  {
    question: "Does Torch offer discounts for first-time dispensary customers?",
    answer:
      "Yes! First-time visitors at Torch receive 10% off their first purchase. Locals from neighborhoods like Logan Circle and Capitol Hill and visitors staying near Downtown hotels or the Convention Center can also join our exclusive text club to unlock ongoing specials, discounts, and updates.",
  },
  {
    question: "Does Torch provide cannabis delivery in Washington, DC, Maryland, and Virginia?",
    answer:
      "Yes, Torch offers discreet cannabis delivery across the DMV area, including Capitol Hill, Dupont Circle, Logan Circle, Shaw, and Penn Quarter. Tourists staying near the National Mall, Union Station, or Downtown hotels can also enjoy convenient delivery directly to their location.",
  },
  {
    question: "What payment methods are accepted at Torch?",
    answer:
      "Torch currently accepts cash payments only. An ATM is available nearby for customer convenience. Whether you’re visiting after sightseeing at the Smithsonian Museums, catching a game at Capital One Arena, or exploring Penn Quarter, we recommend bringing cash for a smooth checkout experience.",
  },
  {
    question: "How can I join Torch’s dispensary loyalty program?",
    answer:
      "Joining our Torch loyalty program is quick and easy—sign up in-store or online. Members in Downtown DC, Capitol Hill, and nearby neighborhoods earn points with every purchase and enjoy exclusive rewards, early access to promotions, and rotating discounts at our Washington, DC dispensary.",
  },
  {
    question: "What is the legal age requirement to buy cannabis in Washington, DC?",
    answer:
      "In Washington, DC, you must be 21 years of age or older with a valid government-issued ID (driver’s license or passport) to purchase cannabis from Torch. This applies to both DC residents and visitors, including those staying near the White House, National Mall, or Capital One Arena.",
  },
  {
    question: "Can I consume cannabis purchased from Torch on-site?",
    answer:
      "No. Torch is a retail cannabis dispensary in Downtown DC and does not allow on-site consumption. All cannabis must be consumed off-premises in accordance with local laws. Whether you’re headed back to your hotel near the Convention Center or Penn Quarter, or exploring Capitol Hill, we encourage safe and responsible cannabis use.",
  },
  {
    question: "Can out-of-state visitors buy cannabis at Torch dispensary?",
    answer:
      "Yes! Visitors 21+ with a valid government-issued ID are welcome to purchase cannabis at Torch. Many tourists shop with us while staying near the National Mall, Smithsonian Museums, Capital One Arena, or Downtown hotels. Please remember that cannabis laws vary by location, so always consume responsibly.",
  },
  {
    question: "What is Torch’s return or exchange policy?",
    answer:
      "Torch stands behind the quality of its products. If you are not satisfied, contact us within 7 days of purchase to discuss a possible exchange or store credit. For health and safety reasons, opened products cannot be returned.",
  },
  {
    question: "Can I buy weed from a dispensary in DC?",
    answer:
      "Yes! Adults 21 and older with a valid government-issued ID can shop premium cannabis from Torch. You can browse our extensive menu online for fast DC delivery or visit our Downtown dispensary at 1000 G St NW. It’s straightforward, smooth, and compliant with all local DC laws.",
  },
  {
    question: "Can tourists buy cannabis in DC?",
    answer:
      "Yes—if you’re 21+, tourists can purchase cannabis from Torch with any valid US state ID or international passport. Just remember that DC local laws end the second you step onto federal land.",
  },
  {
    question: "How much cannabis can I buy in DC?",
    answer:
      "DC law allows adults to possess up to 2 ounces of cannabis for personal use. Torch structures all orders to ensure full compliance with this 2-ounce personal possession limit.",
  },
  {
    question: "What's the price of 7 grams of weed?",
    answer:
      "Prices vary by dispensary and strain, but 7 grams (a quarter ounce) typically ranges from $40 to $90 across our Midshelf, Topshelf, and Private Reserve selections.",
  },
  {
    question: "Can you buy weed online in DC?",
    answer:
      "Yes—Torch accepts online orders for fast DC delivery or curbside pickup. Simply browse our live menu, place your order, and your products are delivered right to your door with Cash on Delivery.",
  },
  {
    question: "Is weed legal in Washington, DC for tourists?",
    answer:
      "For anyone 21+, possession and private use are legal. Tourists can enjoy the same protections as locals, as long as they consume in private residences or hotels and avoid public consumption and federal property.",
  },
];

/** Homepage FAQ, copied word for word from the client reference site (index.html). */
export const HOME_FAQS: FaqItem[] = [
  {
    question: "What are your hours?",
    answer: "Monday to Saturday 7AM to 11PM, Sunday 10AM to 9PM, for delivery and curbside pickup.",
  },
  {
    question: "Where are you located?",
    answer: "1000 G St NW, Washington, DC 20001, in Downtown DC. We deliver across the District.",
  },
  {
    question: "How do I pay?",
    answer: "Cash on delivery. Pay the driver in cash when your order arrives.",
  },
  {
    question: "What products do you carry?",
    answer: "Flower, pre-rolls, disposable vapes, concentrates, edibles and more. Browse the categories above to see the full menu.",
  },
  {
    question: "Is there a first-order discount?",
    answer: "Yes. Let us know it's your first order and we'll throw in something on the house.",
  },
  {
    question: "Which neighborhoods do you deliver to?",
    answer: "All of Washington, DC, including Downtown, Adams Morgan, Dupont Circle, Capitol Hill, Navy Yard, Shaw and Georgetown.",
  },
  {
    question: "How old do I need to be?",
    answer: "You must be 21 or older with a valid government-issued photo ID, checked at delivery or pickup.",
  },
  {
    question: "Can visitors from out of state order?",
    answer: "Yes. Adults 21+ with a valid government-issued photo ID from any state can order.",
  },
  {
    question: "How much cannabis can I have in DC?",
    answer: "Adults 21+ can possess up to 2 ounces in DC.",
  },
  {
    question: "Do you have a loyalty program?",
    answer: "[Describe how customers join and earn rewards]",
  },
  {
    question: "What is your return policy?",
    answer: "[Describe your return and exchange policy]",
  },
];

export function StoreFaqSection({ faqs = FAQS }: { faqs?: FaqItem[] }) {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <details key={index}>
          <summary>{faq.question}</summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </section>
  );
}
