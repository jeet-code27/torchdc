import type { Metadata } from "next";
import { HomeStorefrontView } from "@/components/storefront/home-storefront-view";
import { getShopProducts } from "@/lib/get-shop-products";
import { pageMetadata } from "@/lib/seo-settings";
import { HOME_FAQ } from "@/lib/home-content";
import { faqPageLd } from "@/lib/category-content";
import { jsonLd } from "@/lib/business-schema";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

export const revalidate = 60;

export default async function HomePage() {
  const products = await getShopProducts();

  return (
    <>
      {/* FAQ schema for every homepage question, in the server HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageLd(HOME_FAQ)) }} />
      <HomeStorefrontView products={products} />
    </>
  );
}
