import data from "@/content/static-pages.json";
import { ContentPageView } from "@/components/storefront/content-page-view";
import { jsonLd } from "@/lib/business-schema";
import { pageH1 } from "@/lib/seo-settings";
import { pageBody, schemaForBody } from "@/lib/site-pages";
import { withH1 } from "@/lib/page-html";
import type { LocationPage } from "@/lib/location-pages";

/**
 * FAQ, About, Terms and Privacy as written on the client site (scripts/import-location-pages.py).
 * Server only.
 */
export type StaticPageKey = "faq" | "about" | "terms" | "privacy";
export const STATIC_PAGES = data as Record<StaticPageKey, LocationPage>;

/**
 * The page body plus its own schema (FAQ, breadcrumbs); the business schema comes from the layout.
 * Body from Admin › Pages when edited there, H1 from Admin › SEO when set.
 */
export async function StaticContentPage({ pageKey }: { pageKey: StaticPageKey }) {
  const page = STATIC_PAGES[pageKey];
  const [saved, h1] = await Promise.all([pageBody(pageKey, page.body), pageH1(pageKey)]);
  const body = withH1(saved, h1);
  const schema = saved === page.body ? page.jsonLd : schemaForBody(page.jsonLd, saved);
  return (
    <main>
      {schema.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(d) }} />
      ))}
      <ContentPageView html={body} />
    </main>
  );
}
