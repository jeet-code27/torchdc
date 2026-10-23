import type { Metadata } from "next";
import { FaqPageView } from "@/components/storefront/faq-page-view";

export const metadata: Metadata = {
  title: "Cannabis FAQ for Washington, DC | Torch Cannabis Delivery",
  description:
    "Answers about Torch hours, cash on delivery, ID, deals, flower tiers and DC cannabis law. Free same-day cannabis delivery across Washington, DC.",
};

// FAQ schema from the client site's cannabis-faq-dc.html (Oct 22)
const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are your hours?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We're open 7 days a week, 7AM to 11PM, for delivery and curbside pickup.",
      },
    },
    {
      "@type": "Question",
      name: "Where are you located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1000 G St NW, Washington, DC 20001, in Downtown DC. We deliver across the District.",
      },
    },
    {
      "@type": "Question",
      name: "How do I pay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cash on delivery. Pay your driver in cash when your order arrives. Need change? Tell us at checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Is delivery free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Delivery is free on every order across Washington, DC.",
      },
    },
    {
      "@type": "Question",
      name: "How old do I need to be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You must be 21 or older with a valid government-issued photo ID, checked at delivery or pickup.",
      },
    },
    {
      "@type": "Question",
      name: "Can visitors from out of state order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Adults 21+ with a valid government-issued photo ID from any state can order.",
      },
    },
    {
      "@type": "Question",
      name: "How much cannabis can I have in DC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Adults 21+ can possess up to 2 ounces in DC.",
      },
    },
    {
      "@type": "Question",
      name: "What products do you carry?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Flower in three tiers (Midshelf, Topshelf and Exotic), pre-rolls, disposable vapes, concentrates and edibles.",
      },
    },
    {
      "@type": "Question",
      name: "How do the flower tiers work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Midshelf is quality flower priced for value, Topshelf is our core lineup of classics and Exotic is our small-batch, hard-to-find strains.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a first-order discount?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Let us know it's your first order and we'll throw in something on the house.",
      },
    },
    {
      "@type": "Question",
      name: "How do the deals work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Bundle Deal, Stack & Save and the Half-Pound Haul apply automatically in your cart when you add matching flower. Wake & Bake runs 9AM to 12PM.",
      },
    },
    {
      "@type": "Question",
      name: "Is pickup available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Curbside pickup is paused right now. Choose delivery and it is free, with a pre-roll on us.",
      },
    },
    {
      "@type": "Question",
      name: "Is my order discreet?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Orders are packed in unmarked bags.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      <FaqPageView />
    </>
  );
}
