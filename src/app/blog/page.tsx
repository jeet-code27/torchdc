import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, formatPostDate, blogImage, type BlogListItem } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Torch Cannabis Delivery",
  description: "Guides to DC cannabis, strains and neighborhoods from Torch.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

/** Header markup kept 1:1 with client-reference/blog.html; posts live at the site root like on WordPress. */
export default async function BlogPage() {
  let posts: BlogListItem[] = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    // Database unreachable: show the empty state instead of failing the page
  }

  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <span className="eyebrow">THE TORCH BLOG</span>
          <h1>Blog</h1>
          <span className="muted">Guides to DC cannabis, strains and neighborhoods.</span>
        </section>
        <div className="bloglist">
          {posts.length === 0 ? (
            <p className="muted">No posts yet. Check back soon.</p>
          ) : (
            posts.map((post, i) => (
              <Link key={post.slug} href={`/${post.slug}`} className="blogrow">
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blogImage(post.coverImage, "c_fill,w_280,h_210,f_auto,q_auto")} alt="" loading={i < 4 ? "eager" : "lazy"} />
                )}
                <span>
                  <strong>{post.title}</strong>
                  {post.excerpt && <span className="blogrow__ex">{post.excerpt}</span>}
                  <span className="muted">
                    {formatPostDate(post.publishedAt)} · {post.readTimeMinutes} min read
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
