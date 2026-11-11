import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCATION_PAGES, LOCATION_PAGE_BY_SLUG } from "@/lib/location-pages";
import { LocationPageView } from "@/components/storefront/location-page-view";
import { getShopProducts } from "@/lib/get-shop-products";
import { getPublishedPost } from "@/lib/blog";
import { BlogPostView } from "@/components/storefront/blog-post-view";
import { pageMetadata } from "@/lib/seo-settings";

interface AreaPageProps {
  params: Promise<{ areaSlug: string }>;
}

// Neighborhood pages, DC quadrant hubs, the hotel page, and blog posts
// (old WordPress posts live at the root, e.g. /gifting-vs-legal-weed-shops-dc)
export const revalidate = 3600;

// Only location pages are prerendered; blog posts render on first request and are then cached
// (keeps the build independent of the database, and new posts work without a redeploy)
export async function generateStaticParams() {
  return LOCATION_PAGES.map((p) => ({ areaSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { areaSlug } = await params;
  const page = LOCATION_PAGE_BY_SLUG[areaSlug];

  if (!page) {
    const post = await getPublishedPost(areaSlug).catch(() => null);
    if (!post) return {};
    const description = post.seo.metaDescription || post.excerpt;
    return {
      title: { absolute: post.seo.metaTitle || `${post.title} | Torch Cannabis Delivery` },
      description,
      alternates: { canonical: post.seo.canonicalUrl || `/${post.slug}` },
      openGraph: {
        type: "article",
        title: post.seo.metaTitle || post.title,
        description,
        url: `/${post.slug}`,
        publishedTime: post.publishedAt || undefined,
        modifiedTime: post.updatedAt || undefined,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    };
  }

  // Client's title (src/lib/seo-pages.ts) or the one set on Admin › SEO
  return pageMetadata(`area:${page.slug}`, { alternates: { canonical: `/${page.slug}` } });
}

/** JSON-LD in the server HTML; "<" escaped so text can't close the script tag */
const ld = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaSlug } = await params;
  const page = LOCATION_PAGE_BY_SLUG[areaSlug];

  if (!page) {
    const post = await getPublishedPost(areaSlug);
    if (!post) notFound();
    return <BlogPostView post={post} />;
  }

  let railProducts: Awaited<ReturnType<typeof getShopProducts>> = [];
  if (page.body.includes('data-slot="rail-best"')) {
    const allProducts = await getShopProducts();
    // Same as the client rail (data-rail="best" data-min="4"): best sellers, topped up to 4
    const best = allProducts.filter((p) => p.isBestSeller);
    railProducts =
      best.length >= 4 ? best : [...best, ...allProducts.filter((p) => !p.isBestSeller).slice(0, 4 - best.length)];
  }

  return (
    <main>
      {page.jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(data) }} />
      ))}
      <LocationPageView html={page.body} railProducts={railProducts} />
    </main>
  );
}
