import type { Metadata } from "next";
import { getShopProducts } from "@/lib/get-shop-products";
import { FlowersView } from "@/components/storefront/flowers-view";
import { pageMetadata, pageH1 } from "@/lib/seo-settings";
import { faqPageLd } from "@/lib/category-content";
import { getCategoryCopy } from "@/lib/category-page";
import { jsonLd } from "@/lib/business-schema";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("flowers");
}

export const revalidate = 60;

export default async function FlowersPage({
  searchParams,
}: {
  searchParams?: Promise<{ tier?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const [products, saved, h1] = await Promise.all([getShopProducts(), getCategoryCopy("flowers"), pageH1("flowers")]);
  // H1 from Admin › SEO wins over the one on Admin › Categories
  const copy = { ...saved, h1: h1 || saved.h1 };

  return (
    <>
      {copy.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqPageLd(copy.faq)) }} />
      )}
      <FlowersView initialProducts={products} initialTier={resolvedParams.tier} copy={copy} />
    </>
  );
}
