import data from "@/content/static-pages.json";
import { ContentPageView } from "@/components/storefront/content-page-view";
import { jsonLd } from "@/lib/business-schema";
import type { LocationPage } from "@/lib/location-pages";

/**
 * FAQ, About, Terms and Privacy as written on the client site (scripts/import-location-pages.py).
 * Server only.
 */
export type StaticPageKey = "faq" | "about" | "terms" | "privacy";
export const STATIC_PAGES = data as Record<StaticPageKey, LocationPage>;

/** The page body plus its own schema (FAQ, breadcrumbs); the business schema comes from the layout */
export function StaticContentPage({ pageKey }: { pageKey: StaticPageKey }) {
  const page = STATIC_PAGES[pageKey];
  return (
    <main>
      {page.jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(d) }} />
      ))}
      <ContentPageView html={page.body} />
    </main>
  );
}
