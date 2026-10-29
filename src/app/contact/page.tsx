import type { Metadata } from "next";
import { ContactView } from "@/components/storefront/contact-view";
import { pageMetadata } from "@/lib/seo-settings";

// Title and description: built-in default (src/lib/seo-pages.ts) or the one set on Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", { alternates: { canonical: "/contact-us" } });
}

export default function ContactPage() {
  return <ContactView />;
}
