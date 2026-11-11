/**
 * Sitewide business schema (client site STORE_LD, Nov 10): one LocalBusiness block on every storefront
 * page, server-rendered. Replaces the old homepage-only "Store" block.
 */
export const LOCAL_BUSINESS_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Torch",
  url: "https://torchdc.co/",
  logo: "https://torchdc.co/assets/img/logo.webp",
  telephone: "+1-202-468-1966",
  email: "info@torchdc.co",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1000 G St NW",
    addressLocality: "Washington",
    addressRegion: "DC",
    postalCode: "20001",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "07:00",
      closes: "23:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Washington, DC" },
    { "@type": "State", name: "Maryland" },
    { "@type": "State", name: "Virginia" },
  ],
  paymentAccepted: "Cash",
};

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can't close the tag */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
