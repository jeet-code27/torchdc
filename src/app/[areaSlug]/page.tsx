import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AREAS_LIST, AREAS_BY_SLUG } from "@/lib/areas-data";
import { AreaPageView } from "@/components/storefront/area-page-view";
import { getShopProducts } from "@/lib/get-shop-products";
import { getPublishedPost } from "@/lib/blog";
import { BlogPostView } from "@/components/storefront/blog-post-view";
import { pageMetadata } from "@/lib/seo-settings";

interface AreaPageProps {
  params: Promise<{ areaSlug: string }>;
}

// Neighborhood pages and blog posts (old WordPress posts live at the root, e.g. /gifting-vs-legal-weed-shops-dc)
export const revalidate = 3600;

// Only neighborhoods are prerendered; blog posts render on first request and are then cached
// (keeps the build independent of the database, and new posts work without a redeploy)
export async function generateStaticParams() {
  return AREAS_LIST.map((area) => ({
    areaSlug: area.slug,
  }));
}

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { areaSlug } = await params;
  const area = AREAS_BY_SLUG[areaSlug];

  if (!area) {
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

  // Built-in title (src/lib/seo-pages.ts) or the one set on Admin › SEO
  return pageMetadata(`area:${area.slug}`, { alternates: { canonical: `/${area.slug}` } });
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { areaSlug } = await params;
  const area = AREAS_BY_SLUG[areaSlug];

  if (!area) {
    const post = await getPublishedPost(areaSlug);
    if (!post) notFound();
    return <BlogPostView post={post} />;
  }

  const allProducts = await getShopProducts();
  // Same as the client rail (data-rail="best" data-min="4"): best sellers, topped up to 4
  const best = allProducts.filter((p) => p.isBestSeller);
  const popularProducts =
    best.length >= 4 ? best : [...best, ...allProducts.filter((p) => !p.isBestSeller).slice(0, 4 - best.length)];

  return <AreaPageView area={area} popularProducts={popularProducts} />;
}
