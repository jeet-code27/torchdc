import type { Metadata } from "next";
import { HomeStorefrontView } from "@/components/storefront/home-storefront-view";
import { getShopProducts } from "@/lib/get-shop-products";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

export const revalidate = 60;

// Store schema from the client site (hours: open 7 days a week, 7AM to 11PM)
const STORE_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Torch",
  url: "https://torchdc.co/",
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
  openingHours: ["Mo-Su 07:00-23:00"],
  paymentAccepted: "Cash",
  areaServed: "Washington, DC",
};

export default async function HomePage() {
  const products = await getShopProducts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STORE_LD) }}
      />
      <HomeStorefrontView products={products} />
    </>
  );
}
