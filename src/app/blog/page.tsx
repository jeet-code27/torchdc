import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Torch Cannabis Delivery",
  description: "Guides to DC cannabis, strains and neighborhoods from Torch.",
};

/** Generated from client-reference/blog.html (markup kept 1:1 with the client site). */
export default function BlogPage() {
  return (
    <main>
      <div className="narrow">
        <section className="dealhead">
          <span className="eyebrow">THE TORCH BLOG</span>
          <h1>Blog</h1>
          <span className="muted">Guides to DC cannabis, strains and neighborhoods.</span>
        </section>
        <div className="bloglist">
          <p className="muted">Posts load from WordPress once the store is connected.</p>
        </div>
      </div>
    </main>
  );
}
