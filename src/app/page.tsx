import type { Metadata } from "next";
import { HomeStorefrontView } from "@/components/storefront/home-storefront-view";
import { getShopProducts } from "@/lib/get-shop-products";
import { pageMetadata, pageH1 } from "@/lib/seo-settings";
import { DEFAULT_HOME_COPY, type HomeCopy } from "@/lib/home-content";
import { getSitePages } from "@/lib/site-pages";
import { faqPageLd } from "@/lib/category-content";
import { jsonLd } from "@/lib/business-schema";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("home");
}

export const revalidate = 60;

export default async function HomePage() {
  const [products, h1, pages] = await Promise.all([getShopProducts(), pageH1("home"), getSitePages()]);
  // Intro, chips and FAQ saved on Admin › Pages (each one empty: the client's copy)
  const saved = pages.home;
  const faq = (saved?.faq || []).filter((f) => f.q.trim() && f.a.trim());
  const copy: HomeCopy = {
    h1: h1 || DEFAULT_HOME_COPY.h1,
    introHtml: saved?.body.trim() || DEFAULT_HOME_COPY.introHtml,
    chips: saved?.chips.length ? saved.chips : DEFAULT_HOME_COPY.chips,
    faq: faq.length ? faq : DEFAULT_HOME_COPY.faq,
  };

  return (
    <>
      {/* FAQ schema for every homepage question, in the server HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageLd(copy.faq)) }} />
      <HomeStorefrontView products={products} copy={copy} />
    </>
  );
}
