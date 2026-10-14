"use client";

import * as React from "react";
import { Plus, Minus, ChevronRight, ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "1. What are the operating hours of Torch cannabis dispensary in Downtown Washington, DC?",
    answer:
      "Torch is open 7 days a week from 7:00 AM to 12:00 AM (midnight). Whether you’re in Penn Quarter, Chinatown, or Capitol Hill, or visiting nearby attractions like the National Mall or the White House, you can stop by our Downtown DC dispensary during these hours to shop our premium cannabis menu.",
  },
  {
    question: "2. How can I find Torch dispensary in Washington, DC?",
    answer:
      "Torch is centrally located in Downtown Washington, DC at 1000 G St NW, just minutes from Capital One Arena, the Walter E. Washington Convention Center, and the Smithsonian Museums. Simply search “Torch cannabis dispensary near me” or “weed dispensary in Downtown DC” on Google Maps. You can also visit our website for exact address and directions.",
  },
  {
    question: "3. What types of cannabis products does Torch carry?",
    answer:
      "Torch offers one of the most diverse cannabis menus in the DC metro area. Our Downtown dispensary features premium flower strains, pre-rolls, concentrates, edibles, tinctures, topicals, vape cartridges, CBD selections, and a curated range of cannabis accessories. Whether you’re staying near the National Mall, attending a concert at Capital One Arena, or exploring Dupont Circle or Shaw, Torch has high-quality cannabis products to fit your needs.",
  },
  {
    question: "4. Does Torch offer discounts for first-time dispensary customers?",
    answer:
      "Yes! First-time visitors at Torch receive 10% off their first purchase. Locals from neighborhoods like Logan Circle and Capitol Hill and visitors staying near Downtown hotels or the Convention Center can also join our exclusive text club to unlock ongoing specials, discounts, and updates.",
  },
  {
    question: "5. Does Torch provide cannabis delivery in Washington, DC, Maryland, and Virginia?",
    answer:
      "Yes, Torch offers discreet cannabis delivery across the DMV area, including Capitol Hill, Dupont Circle, Logan Circle, Shaw, and Penn Quarter. Tourists staying near the National Mall, Union Station, or Downtown hotels can also enjoy convenient delivery directly to their location.",
  },
  {
    question: "6. What payment methods are accepted at Torch?",
    answer:
      "Torch currently accepts cash payments only. An ATM is available nearby for customer convenience. Whether you’re visiting after sightseeing at the Smithsonian Museums, catching a game at Capital One Arena, or exploring Penn Quarter, we recommend bringing cash for a smooth checkout experience.",
  },
  {
    question: "7. How can I join Torch’s dispensary loyalty program?",
    answer:
      "Joining our Torch loyalty program is quick and easy—sign up in-store or online. Members in Downtown DC, Capitol Hill, and nearby neighborhoods earn points with every purchase and enjoy exclusive rewards, early access to promotions, and rotating discounts at our Washington, DC dispensary.",
  },
  {
    question: "8. What is the legal age requirement to buy cannabis in Washington, DC?",
    answer:
      "In Washington, DC, you must be 21 years of age or older with a valid government-issued ID (driver’s license or passport) to purchase cannabis from Torch. This applies to both DC residents and visitors, including those staying near the White House, National Mall, or Capital One Arena.",
  },
  {
    question: "9. Can I consume cannabis purchased from Torch on-site?",
    answer:
      "No. Torch is a retail cannabis dispensary in Downtown DC and does not allow on-site consumption. All cannabis must be consumed off-premises in accordance with local laws. Whether you’re headed back to your hotel near the Convention Center or Penn Quarter, or exploring Capitol Hill, we encourage safe and responsible cannabis use.",
  },
  {
    question: "10. Can out-of-state visitors buy cannabis at Torch dispensary?",
    answer:
      "Yes! Visitors 21+ with a valid government-issued ID are welcome to purchase cannabis at Torch. Many tourists shop with us while staying near the National Mall, Smithsonian Museums, Capital One Arena, or Downtown hotels. Please remember that cannabis laws vary by location, so always consume responsibly.",
  },
  {
    question: "11. What is Torch’s return or exchange policy?",
    answer:
      "Torch stands behind the quality of its products. If you are not satisfied, contact us within 7 days of purchase to discuss a possible exchange or store credit. For health and safety reasons, opened products cannot be returned.",
  },
  {
    question: "12. Can I buy weed from a dispensary in DC?",
    answer:
      "Yes! Adults 21 and older with a valid government-issued ID can shop premium cannabis from Torch. You can browse our extensive menu online for fast DC delivery or visit our Downtown dispensary at 1000 G St NW. It’s straightforward, smooth, and compliant with all local DC laws.",
  },
  {
    question: "13. Can tourists buy cannabis in DC?",
    answer:
      "Yes—if you’re 21+, tourists can purchase cannabis from Torch with any valid US state ID or international passport. Just remember that DC local laws end the second you step onto federal land.",
  },
  {
    question: "14. How much cannabis can I buy in DC?",
    answer:
      "DC law allows adults to possess up to 2 ounces of cannabis for personal use. Torch structures all orders to ensure full compliance with this 2-ounce personal possession limit.",
  },
  {
    question: "15. What's the price of 7 grams of weed?",
    answer:
      "Prices vary by dispensary and strain, but 7 grams (a quarter ounce) typically ranges from $40 to $90 across our Midshelf, Topshelf, and Private Reserve selections.",
  },
  {
    question: "16. Can you buy weed online in DC?",
    answer:
      "Yes—Torch accepts online orders for fast DC delivery or curbside pickup. Simply browse our live menu, place your order, and your products are delivered right to your door with Cash on Delivery.",
  },
  {
    question: "17. Is weed legal in Washington, DC for tourists?",
    answer:
      "For anyone 21+, possession and private use are legal. Tourists can enjoy the same protections as locals, as long as they consume in private residences or hotels and avoid public consumption and federal property.",
  },
];

export function StoreFaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-8 sm:py-12">
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-neutral-900 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-neutral-200/80 border-y border-neutral-200/80">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full py-4 sm:py-4.5 px-1 sm:px-2 flex items-center justify-between text-left gap-4 group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    <span className="text-neutral-700 font-bold text-base sm:text-lg shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-neutral-800 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 text-neutral-800 stroke-[2.5]" />
                      )}
                    </span>
                    <span className="text-xs sm:text-sm md:text-[15px] font-bold text-neutral-900 group-hover:text-[#5A805B] transition-colors leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <span className="text-neutral-400 shrink-0 pl-2">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-neutral-700 stroke-[2]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-400 stroke-[2]" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-4 sm:pb-5 pl-8 sm:pl-10 pr-4 sm:pr-8 text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium animate-in fade-in-50 duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
