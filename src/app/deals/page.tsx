import type { Metadata } from "next";
import { DealsView } from "@/components/storefront/deals-view";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("deals");
}

export const revalidate = 60;

export default function DealsPage() {
  return <DealsView />;
}
