import Link from "next/link";
import { BlogPostData, formatPostDate, blogImage } from "@/lib/blog";
import { SAME_DAY_PATH, postShopLinks } from "@/lib/blog-links";

const SITE = "https://torchdc.co";

/** Single blog post, served at the site root (/<slug>) like on WordPress. */
/** "October 25, 2026" */
function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
}

export function BlogPostView({ post }: { post: BlogPostData }) {
  const shop = postShopLinks(post.shopLinks, post.title);
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
          {/* Content spec 8.2: visible "Last updated" under the H1 */}
          {post.updatedAt && <span className="updated">Last updated: {formatLongDate(post.updatedAt)}</span>}
        </section>
        {post.quickAnswer && (
          <div className="quickans">
            <span className="quickans__k">QUICK ANSWER</span>
            <p>{post.quickAnswer}</p>
          </div>
        )}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="postcover" src={blogImage(post.coverImage, "c_limit,w_1200,f_auto,q_auto")} alt={post.coverImageAlt || post.title} />
        )}
        <article className="prose postbody" dangerouslySetInnerHTML={{ __html: post.content }} />
        {(shop.length > 0 || post.slug !== SAME_DAY_PATH.slice(1)) && (
          <p className="postshop">
            {shop.length > 0 && (
              <>
                <strong>Order now:</strong>{" "}
                {shop.map((c, i) => (
                  <span key={c.slug}>
                    {i > 0 && " · "}
                    <Link href={c.href}>{c.label}</Link>
                  </span>
                ))}
              </>
            )}
            {shop.length > 0 && post.slug !== SAME_DAY_PATH.slice(1) && <span className="postshop__sep"> | </span>}
            {post.slug !== SAME_DAY_PATH.slice(1) && <Link href={SAME_DAY_PATH}>Same-day delivery in DC</Link>}
          </p>
        )}
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
