import type { Metadata } from "next";
import { AboutStorefrontView } from "@/components/storefront/about-storefront-view";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("about");
}

export default function AboutPage() {
  return <AboutStorefrontView />;
}
