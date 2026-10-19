import { cache } from "react";
import { connectToDatabase } from "@/lib/db";
import { Blog } from "@/models/Blog";

export interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  readTimeMinutes: number;
  publishedAt: string | null;
  updatedAt: string | null;
  seo: { metaTitle?: string; metaDescription?: string; canonicalUrl?: string };
}

export interface BlogListItem {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  readTimeMinutes: number;
  publishedAt: string | null;
}

const iso = (d?: Date | null) => (d ? new Date(d).toISOString() : null);

/** A published post by slug (posts live at the site root, same URLs as on WordPress). */
export const getPublishedPost = cache(async (slug: string): Promise<BlogPostData | null> => {
  await connectToDatabase();
  const post = await Blog.findOne({ slug: slug.toLowerCase(), isPublished: true }).lean();
  if (!post) return null;
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    coverImage: post.coverImage || "",
    author: post.author,
    category: post.category || "",
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: iso(post.publishedAt),
    updatedAt: iso(post.updatedAt),
    seo: post.seo || {},
  };
});

export async function getPublishedPosts(): Promise<BlogListItem[]> {
  await connectToDatabase();
  const posts = await Blog.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .select("title slug excerpt coverImage readTimeMinutes publishedAt")
    .lean();
  return posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "",
    coverImage: p.coverImage || "",
    readTimeMinutes: p.readTimeMinutes,
    publishedAt: iso(p.publishedAt),
  }));
}

/** Resized, auto-format Cloudinary URL (other URLs are returned unchanged). */
export function blogImage(url: string, transform: string): string {
  return url.includes("res.cloudinary.com/") ? url.replace("/image/upload/", `/image/upload/${transform}/`) : url;
}

export function formatPostDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}
