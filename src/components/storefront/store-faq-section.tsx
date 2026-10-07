"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What are your hours?",
    answer:
      "We are open daily from 9:00 AM to 11:00 PM for both delivery and curbside pickup across Washington, DC.",
  },
  {
    question: "Where are you located?",
    answer:
      "Our curbside pickup hub is conveniently located in Downtown Washington, DC on F St NW. Same-day discreet delivery is available to all DC addresses.",
  },
  {
    question: "What products do you carry?",
    answer:
      "We carry premium cannabis flowers, hand-crafted pre-rolls, disposable vapes, concentrates, cartridges, edibles, and organic mushrooms.",
  },
  {
    question: "Is there a first-order discount?",
    answer:
      "Yes. First-time buyers get 3 free prerolls with 1 oz of Midshelf or Topshelf, or a free 1/8th with 1 oz of Private Reserve.",
  },
  {
    question: "Which neighborhoods do you deliver to?",
    answer:
      "We deliver to all Washington, DC quadrants and neighborhoods including Downtown, Adams Morgan, Dupont Circle, Capitol Hill, Navy Yard, Shaw, Georgetown, Logan Circle, NoMa, and beyond.",
  },
  {
    question: "How old do I need to be?",
    answer:
      "You must be 21 years of age or older with a valid government-issued photo ID (state ID, driver's license, or passport) in accordance with DC Initiative 71.",
  },
  {
    question: "Can visitors from out of state order?",
    answer:
      "Yes! Any adult 21+ with a valid government-issued ID from any US state or international passport can order for delivery to any DC residential address, hotel, or Airbnb.",
  },
  {
    question: "How much cannabis can I have in DC?",
    answer:
      "Under Washington DC Initiative 71 regulations, adults 21 and older may possess up to 2 ounces of cannabis for personal use.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery (COD) upon delivery, as well as electronic payment arrangements made with your dispatcher. Exact change is appreciated.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Due to DC health guidelines, opened cannabis products cannot be returned. If you receive a defective cartridge or disposable hardware, reach out to our team within 24 hours for a hassle-free replacement.",
  },
];

export function StoreFaqSection() {
  // Pre-expand question #4 ("Is there a first-order discount?") as shown in the screenshot
  const [openIndex, setOpenIndex] = React.useState<number | null>(3);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ================= LEFT COLUMN: SEO EDITORIAL ================= */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-gray-900 tracking-tight leading-[1.15]">
            Washington DC&apos;s Trusted Cannabis Delivery
          </h2>

          <div className="space-y-4 text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal">
            <p>
              Torch delivers top-shelf{" "}
              <Link
                href="/category/flowers"
                className="text-[#557754] font-semibold hover:underline"
              >
                cannabis flower
              </Link>
              ,{" "}
              <Link
                href="/category/pre-rolls"
                className="text-[#557754] font-semibold hover:underline"
              >
                pre-rolls
              </Link>
              ,{" "}
              <Link
                href="/category/disposables"
                className="text-[#557754] font-semibold hover:underline"
              >
                disposable vapes
              </Link>
              , concentrates and{" "}
              <Link
                href="/category/edibles"
                className="text-[#557754] font-semibold hover:underline"
              >
                edibles
              </Link>{" "}
              anywhere in Washington, DC, usually the same day. Order online or
              by phone, or choose curbside pickup at our Downtown location on F
              St NW.
            </p>

            <p>
              We serve Downtown, Adams Morgan, Dupont Circle, Capitol Hill, Navy
              Yard, Shaw, Georgetown and every neighborhood in between. Every
              order is packed discreetly and handed over only after a 21+ ID check.
            </p>
          </div>

          <div>
            <Link
              href="/about"
              className="inline-block text-xs sm:text-sm font-bold text-[#557754] hover:text-[#3f5a3e] underline underline-offset-4 transition-colors"
            >
              More about Torch
            </Link>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: FAQS ACCORDION ================= */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-6">
            Frequently Asked Questions
          </h3>

          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={index} className="py-3.5 sm:py-4 transition-colors">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-[15px] font-bold text-gray-900 group-hover:text-[#557754] transition-colors leading-snug">
                      {faq.question}
                    </span>

                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#eaf3ea] text-[#557754]"
                          : "bg-[#f4f7f4] text-[#557754] group-hover:bg-[#eaf3ea]"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pt-3 pr-8 text-xs sm:text-[13px] text-gray-600 leading-relaxed font-normal animate-in fade-in-50 duration-200">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
