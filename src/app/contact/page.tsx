import type { Metadata } from "next";
import { ContactView } from "@/components/storefront/contact-view";
import { pageMetadata, pageH1 } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", { alternates: { canonical: "/contact-us" } });
}

export default async function ContactPage() {
  return <ContactView h1={await pageH1("contact")} />;
}
