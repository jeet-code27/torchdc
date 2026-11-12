import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { SitePage } from "@/models/SitePage";
import { faqFromHtml, htmlText, firstH1, type FaqItem } from "@/lib/page-html";
import { faqPageLd } from "@/lib/category-content";
import type { LocationState } from "@/lib/location-groups";

/** Page copy saved on Admin › Pages (server only). Cached; saving refreshes it (revalidateTag). */
export const SITE_PAGES_TAG = "site-pages";

export type SitePageData = {
  key: string;
  body: string;
  chips: string[];
  faq: FaqItem[];
  custom: boolean;
  slug: string;
  name: string;
  state: LocationState | "";
  title: string;
  description: string;
  isPublished: boolean;
  updatedAt: string | null;
};

export const getSitePages = unstable_cache(
  async (): Promise<Record<string, SitePageData>> => {
    try {
      await connectToDatabase();
      const docs = await SitePage.find({}).lean();
      return Object.fromEntries(
        docs.map((d) => [
          d.key,
          {
            key: d.key,
            body: d.body || "",
            chips: d.chips || [],
            faq: (d.faq || []).map((f) => ({ q: f.q, a: f.a })),
            custom: Boolean(d.custom),
            slug: d.slug || "",
            name: d.name || "",
            state: (d.state || "") as LocationState | "",
            title: d.title || "",
            description: d.description || "",
            isPublished: Boolean(d.isPublished),
            updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
          },
        ])
      );
    } catch {
      // Database unreachable (e.g. at build time): the built-in copy is used
      return {};
    }
  },
  ["site-pages"],
  { tags: [SITE_PAGES_TAG], revalidate: 3600 }
);

/** Body saved in the admin for a built-in page, else its built-in body */
export async function pageBody(key: string, builtIn: string): Promise<string> {
  const saved = (await getSitePages())[key];
  return saved && !saved.custom && saved.body.trim() ? saved.body : builtIn;
}

/** New neighborhood pages that are switched on */
export async function customAreaPages(): Promise<SitePageData[]> {
  return Object.values(await getSitePages()).filter((p) => p.custom && p.isPublished && p.slug && p.name);
}

export async function customAreaPage(slug: string): Promise<SitePageData | null> {
  const p = (await getSitePages())[`area:${slug}`];
  return p && p.custom && p.isPublished ? p : null;
}

/**
 * Schema for a page whose body was edited: the FAQPage entry is rebuilt from the questions now on
 * the page (dropped when there are none); other entries are kept.
 */
export function schemaForBody(jsonLd: Record<string, unknown>[], html: string): Record<string, unknown>[] {
  const faq = faqFromHtml(html);
  const rest = jsonLd.filter((d) => d["@type"] !== "FAQPage");
  return faq.length ? [...rest, faqPageLd(faq)] : rest;
}

/** Schema for a new neighborhood page: breadcrumbs, plus FAQPage when the page has questions */
export function customPageSchema(p: SitePageData): Record<string, unknown>[] {
  const url = `https://torchdc.co/${p.slug}`;
  const out: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://torchdc.co/" },
        { "@type": "ListItem", position: 2, name: firstH1(p.body) || p.name, item: url },
      ],
    },
  ];
  const faq = faqFromHtml(p.body);
  if (faq.length) out.push(faqPageLd(faq));
  return out;
}

export { htmlText };
