import Link from "next/link";
import { BlogPostData, formatPostDate, blogImage } from "@/lib/blog";

const SITE = "https://torchdc.co";

/** Single blog post, served at the site root (/<slug>) like on WordPress. */
export function BlogPostView({ post }: { post: BlogPostData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.metaDescription || post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || post.publishedAt || undefined,
    author: { "@type": "Organization", name: "Torch" },
    publisher: { "@type": "Organization", name: "Torch", url: SITE },
    mainEntityOfPage: `${SITE}/${post.slug}`,
  };

  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <span className="eyebrow">THE TORCH BLOG</span>
          <h1>{post.title}</h1>
          <span className="muted">
            {formatPostDate(post.publishedAt)} · {post.readTimeMinutes} min read
          </span>
        </section>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="postcover" src={blogImage(post.coverImage, "c_limit,w_1200,f_auto,q_auto")} alt={post.title} />
        )}
        <article className="prose postbody" dangerouslySetInnerHTML={{ __html: post.content }} />
        <p className="postback">
          <Link href="/blog">← All posts</Link>
        </p>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </main>
  );
}
