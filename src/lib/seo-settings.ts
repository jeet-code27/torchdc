import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { SeoSettings } from "@/models/SeoSettings";
import { SEO_PAGE_BY_KEY } from "@/lib/seo-pages";

export const SEO_SETTINGS_TAG = "seo-settings";

export type PageSeoOverride = { title?: string; description?: string; noindex?: boolean };
export type SeoSettingsData = {
  googleVerification: string;
  bingVerification: string;
  defaultShareImage: string;
  pages: Record<string, PageSeoOverride>;
};

const EMPTY: SeoSettingsData = { googleVerification: "", bingVerification: "", defaultShareImage: "", pages: {} };

/** Admin › SEO settings, cached and refreshed the moment the admin saves (revalidateTag). */
export const getSeoSettings = unstable_cache(
  async (): Promise<SeoSettingsData> => {
    try {
      await connectToDatabase();
      const doc = await SeoSettings.findOne({ key: "default" }).lean();
      if (!doc) return EMPTY;
      const pages = doc.pages instanceof Map ? Object.fromEntries(doc.pages) : (doc.pages as Record<string, PageSeoOverride>) || {};
      return {
        googleVerification: doc.googleVerification || "",
        bingVerification: doc.bingVerification || "",
        defaultShareImage: doc.defaultShareImage || "",
        pages,
      };
    } catch {
      // Database unreachable (e.g. at build time): the built-in titles still work
      return EMPTY;
    }
  },
  ["seo-settings"],
  { tags: [SEO_SETTINGS_TAG], revalidate: 3600 }
);

/**
 * Metadata for a page in the SEO page list: its built-in title/description, replaced by whatever
 * is set on Admin › SEO, plus "noindex" when the page is hidden from search.
 */
export async function pageMetadata(key: string, extra: Metadata = {}): Promise<Metadata> {
  const page = SEO_PAGE_BY_KEY[key];
  const override = (await getSeoSettings()).pages[key] || {};
  const title = override.title?.trim() || page?.title || "";
  const description = override.description?.trim() || page?.description || "";
  return {
    ...extra,
    title: { absolute: title },
    description,
    openGraph: { ...(extra.openGraph || {}), title, description },
    ...(override.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Page keys hidden from search, for the sitemap. */
export async function noindexPaths(): Promise<Set<string>> {
  const pages = (await getSeoSettings()).pages;
  return new Set(
    Object.entries(pages)
      .filter(([, v]) => v?.noindex)
      .map(([k]) => SEO_PAGE_BY_KEY[k]?.path)
      .filter((p): p is string => Boolean(p))
  );
}

/** "google-site-verification" tags are often pasted whole; keep only the content value. */
export function cleanVerification(input: string) {
  const v = String(input || "").trim();
  const m = v.match(/content=["']([^"']+)["']/i);
  return (m ? m[1] : v).replace(/^google-site-verification[=:]\s*/i, "").slice(0, 200);
}

type ItemSeo = { metaTitle?: string; metaDescription?: string; canonicalUrl?: string; metaRobotsIndex?: boolean; useCustom?: boolean } | null | undefined;

/**
 * A product's or category's own SEO fields, as the website should use them: title / description only
 * when "Use this title & description on the website" is on (older imported values stay unused),
 * a canonical only when it points at this site, and noindex when indexing is switched off.
 */
export function itemSeo(seo: ItemSeo) {
  const custom = Boolean(seo?.useCustom);
  const canonical = String(seo?.canonicalUrl || "").trim();
  return {
    title: custom ? seo?.metaTitle?.trim() || "" : "",
    description: custom ? seo?.metaDescription?.trim() || "" : "",
    canonical: custom && /^(\/|https:\/\/(www\.)?torchdc\.co\/)/.test(canonical) ? canonical : "",
    noindex: seo?.metaRobotsIndex === false,
  };
}
