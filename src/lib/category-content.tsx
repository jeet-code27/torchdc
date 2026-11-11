/**
 * Category page copy from the client site (build.py CAT_LABEL, CAT_INTRO, CAT_FAQ, FLOWER_FAQ; Nov 9 and 10).
 * Answers may contain links. Small and browser-safe (the shop page is a browser component).
 */

export type Faq = { q: string; a: string };

/** Small orange label above the category heading. None on Shop All. */
export const CATEGORY_LABEL: Record<string, string> = {
  edibles: "GUMMIES & MORE",
  disposables: "READY TO VAPE",
  cartridges: "JUST ADD A BATTERY",
  "pre-rolls": "READY TO LIGHT",
  concentrates: "FOR CONNOISSEURS",
};

export const CATEGORY_INTRO: Record<string, string> = {
  flowers:
    "Shop weed flower by the eighth, quarter, half ounce or ounce at Torch, delivered across DC, Maryland and Virginia. Pick your tier: Midshelf, quality flower priced for everyday value; Topshelf, our top shelf lineup of trusted classics; or Exotic, our most premium cannabis flower in rare, small-batch strains. Every strain is labeled Indica, Sativa or Hybrid. Free delivery in DC, 7AM to 11PM.",
  "pre-rolls":
    "Shop pre-rolls in DC from Torch, from classic flower pre-rolls to infused pre-rolls, in Indica, Sativa and Hybrid. Same-day pre-roll delivery, free anywhere in DC, 7AM to 11PM.",
  disposables:
    "Shop THC disposable vapes and disposable weed pens from Torch, delivered across DC, Maryland and Virginia. Choose from cannabis disposables in a range of flavors and Indica, Sativa and Hybrid strains. Every THC vape pen is ready to use out of the box. Free delivery in DC, 7AM to 11PM.",
  cartridges:
    "Shop THC carts and weed carts from Torch when they're in stock. Our THC cartridges fit a standard 510 battery and come delivered across DC, Maryland and Virginia. Free delivery in DC, 7AM to 11PM.",
  concentrates: "Torch delivers cannabis concentrates across DC, Maryland and Virginia. Free delivery in DC, 7AM to 11PM.",
  edibles:
    "Shop THC gummies, weed edibles and THC chocolate from Torch, delivered across DC, Maryland and Virginia. Choose everyday gummies or high-dose cannabis edibles for experienced users. Free delivery in DC, 7AM to 11PM.",
};

/** FAQ under the products (shown for that category, not during a search) */
export const CATEGORY_FAQ: Record<string, { title: string; items: Faq[] }> = {
  disposables: {
    title: "Disposables FAQ",
    items: [
      { q: "What THC disposables do you carry?", a: "A rotating selection of disposable weed pens in different flavors and strains. The menu changes often, so check above for what's in stock." },
      { q: "Does a disposable weed pen need a battery?", a: "No. A THC disposable is a ready-to-use vape pen with the battery built in. THC carts are different: they screw onto a separate 510 battery." },
      { q: "Can I get a THC vape delivered today?", a: "Yes. Order by 11PM and most weed vape and weed pen orders arrive in 30 to 90 minutes after your ID is verified. Delivery is free anywhere in DC." },
      { q: "Do you sell THC carts?", a: 'Yes, when they are in stock. THC and weed carts are on our <a href="/product-category/cartridges">Cartridges</a> page and fit a standard 510 battery.' },
    ],
  },
  cartridges: {
    title: "Cartridges FAQ",
    items: [
      { q: "What battery do your THC carts fit?", a: "Our THC cartridges fit a standard 510-thread battery, the most common vape battery." },
      { q: "Carts or disposables: which should I get?", a: 'Carts need a separate 510 battery but cost less per refill. A <a href="/product-category/disposables">THC disposable</a> has the battery built in and is ready to use out of the box.' },
      { q: "Can I get THC carts delivered today?", a: "Yes, when they are in stock. Most orders arrive in 30 to 90 minutes after your ID is verified, and delivery is free anywhere in DC." },
    ],
  },
  edibles: {
    title: "Edibles FAQ",
    items: [
      { q: "Do you have high-dose edibles?", a: "Yes, along with everyday gummies. Doses vary by product, so check the label on each item above." },
      { q: "Do you sell THC chocolate?", a: "Yes, when it's in stock. Check above for current flavors." },
      { q: "How long do edibles take to kick in?", a: "Usually 30 minutes to 2 hours. Start with a low dose and wait before taking more." },
      { q: "Can I get weed gummies delivered today?", a: "Yes. Order by 11PM and most weed edibles orders arrive in 30 to 90 minutes after your ID is verified. Delivery is free anywhere in DC." },
    ],
  },
  "pre-rolls": {
    title: "Pre-rolls FAQ",
    items: [
      { q: "What are infused pre-rolls?", a: "Infused pre-rolls, sometimes called enhanced pre-rolls, have extra concentrate added for a stronger effect." },
      { q: "Do you have Indica, Sativa and Hybrid pre-rolls?", a: "Yes. Every pre-roll is labeled Indica, Sativa or Hybrid. Sizes vary by product, so check each item above." },
      { q: "Can I get pre-rolls delivered today?", a: "Yes. Order by 11PM and most pre-roll orders arrive in 30 to 90 minutes after your ID is verified. Delivery is free anywhere in DC." },
    ],
  },
};

export const FLOWER_FAQ: Faq[] = [
  { q: "What's the difference between Midshelf, Topshelf and Exotic?", a: "Midshelf is quality flower priced for value, Topshelf is our core lineup of classics, and Exotic is small-batch, hard-to-find strains." },
  { q: "Is flower delivery free?", a: "Free anywhere in DC. Maryland and Virginia delivery is $20 or $40, depending on distance." },
  { q: "How fast is flower delivery?", a: "Most orders arrive in 30 to 90 minutes after your ID is verified, depending on traffic." },
  { q: "Can I buy an eighth of weed?", a: "Yes. Topshelf and Exotic flower come in eighths (3.5g) and quarter ounces (7g), and every tier comes in half ounces and ounces. Topshelf eighths start at $40." },
  { q: "How much is an ounce of weed?", a: "An ounce of weed is $100 for Midshelf, $140 for Topshelf and $220 for Exotic. Buy 2 to 4 ounces and you save more with our ounce deals." },
  { q: "Do you have Indica, Sativa and Hybrid strains?", a: "Yes. Every strain is labeled Indica, Sativa or Hybrid, so you can pick the type you like." },
  { q: "Can I get weed flower delivered today?", a: "Yes. Order by 11PM and most weed flower delivery orders arrive in 30 to 90 minutes after your ID is verified. Delivery is free anywhere in DC." },
];

/** Tier card text (client site, Nov 9) */
export const TIER_TEXT: Record<string, string> = {
  Midshelf: "Quality flower priced for everyday value.",
  Topshelf: "Our core lineup of trusted classics.",
  Exotic: "Rare, small-batch strains for connoisseurs.",
};

/** FAQPage schema; answers without their HTML tags */
export function faqPageLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") },
    })),
  };
}

/** The client's FAQ block: <section class="faq"> with one <details> per question */
export function FaqSection({ title, items, id = "faq", headingId = "faq-h" }: { title: string; items: Faq[]; id?: string; headingId?: string }) {
  return (
    <section className="faq" id={id} aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p dangerouslySetInnerHTML={{ __html: f.a }} />
        </details>
      ))}
    </section>
  );
}
