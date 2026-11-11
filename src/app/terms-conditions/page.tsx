import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-settings";
import { StaticContentPage } from "@/lib/static-pages";

// Title and description: client's (src/content/static-pages.json) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("terms");
}

export const revalidate = 86400;

/** Content from the client site, word for word (scripts/import-location-pages.py) */
export default function TermsConditionsPage() {
  return <StaticContentPage pageKey="terms" />;
}
