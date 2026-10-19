import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Blog } from "@/models/Blog";
import { AREAS_LIST } from "@/lib/areas-data";

const SITE = "https://torchdc.co";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/flowers`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/deals`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/contact-us`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${SITE}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms-conditions`, changeFrequency: "yearly", priority: 0.2 },
    ...AREAS_LIST.map((a) => ({
      url: `${SITE}/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  try {
    await connectToDatabase();
    const [products, posts] = await Promise.all([
      Product.find({ isActive: true }).select("slug updatedAt").lean(),
      Blog.find({ isPublished: true }).select("slug updatedAt").lean(),
    ]);
    return [
      ...pages,
      ...products.map((p) => ({
        url: `${SITE}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      // Blog posts keep their WordPress URLs at the site root
      ...posts.map((p) => ({
        url: `${SITE}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // Database unreachable at build/revalidate time: still serve the static pages
    return pages;
  }
}
