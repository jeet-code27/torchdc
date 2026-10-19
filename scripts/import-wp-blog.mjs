// Import blog posts from the live WordPress site (torchdc.co) into the Blog collection.
//
//   node --env-file=.env scripts/import-wp-blog.mjs           # dry run (default): fetch + report, no writes
//   node --env-file=.env scripts/import-wp-blog.mjs --write   # upload images to Cloudinary + upsert posts by slug
//
// Re-runnable: posts are upserted by their exact WordPress slug, and images use a fixed
// Cloudinary public_id (torch/blog/<file name>) so re-runs reuse already uploaded files.
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const WP = "https://torchdc.co";
const WRITE = process.argv.includes("--write");
// torchdc.co's firewall returns 403 to non-browser user agents
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "Torch Team" },
    category: { type: String, default: "Cannabis Education" },
    tags: [{ type: String }],
    readTimeMinutes: { type: Number, default: 3 },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      focusKeyword: { type: String },
      canonicalUrl: { type: String },
    },
  },
  { timestamps: true }
);
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
const text = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

// Any WordPress-hosted image URL (direct, via the Jetpack i0/i1/i2.wp.com CDN, or an Optimole
// URL wrapped in it, e.g. i0.wp.com/x.i.optimole.com/w%3Aauto/https%3A//torchdc.co/...) -> original file URL
const IMG_RE = /https?:\/\/(?:i\d\.wp\.com\/(?:[^"'\s]*?https?%3A\/\/)?)?(?:www\.)?torchdc\.co\/wp-content\/uploads\/[^"'\s?)]+\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"'\s)]*)?/gi;
const originalUrl = (u) => `${WP}/wp-content/uploads/${u.split("/wp-content/uploads/")[1].split("?")[0]}`;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return { data: await res.json(), headers: res.headers };
}

async function fetchPosts() {
  const posts = [];
  for (let page = 1; ; page++) {
    const { data, headers } = await fetchJson(`${WP}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed`);
    posts.push(...data);
    if (page >= Number(headers.get("x-wp-totalpages") || 1)) break;
  }
  return posts;
}

async function fetchSitemapSlugs() {
  const res = await fetch(`${WP}/post-sitemap.xml`, { headers: { "User-Agent": UA } });
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/^\/|\/$/g, ""));
}

const uploaded = new Map(); // original URL -> Cloudinary URL (or original on failure)
const failedUploads = [];
async function uploadImage(url) {
  if (uploaded.has(url)) return uploaded.get(url);
  const file = url.split("/").pop().replace(/\.[^.]+$/, "");
  let result = url;
  try {
    let res = await fetch(url, { headers: { "User-Agent": UA } });
    // Some posts reference a resized copy (-300x200) that no longer exists; fall back to the original
    if (res.status === 404 && /-\d+x\d+\.\w+$/.test(url)) {
      res = await fetch(url.replace(/-\d+x\d+(\.\w+)$/, "$1"), { headers: { "User-Agent": UA } });
    }
    if (res.status === 404) result = null; // gone from WordPress too: the <img> is dropped
    if (!res.ok) throw new Error(`download ${res.status}`);
    const type = res.headers.get("content-type") || "image/jpeg";
    const b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    const up = await cloudinary.uploader.upload(`data:${type};base64,${b64}`, {
      public_id: `torch/blog/${file}`,
      overwrite: false,
      resource_type: "image",
    });
    result = up.secure_url;
  } catch (err) {
    failedUploads.push(`${url} (${err.message || err}${result === null ? ", image removed" : ", kept WordPress URL"})`);
  }
  uploaded.set(url, result);
  return result;
}

function cleanContent(html) {
  return (
    html
      // The title is rendered by the page, drop WordPress's leading copy of it
      .replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "")
      // WordPress post embeds (iframe + script); the <blockquote> link fallback stays
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      // Responsive variants point at WordPress; keep the single src
      .replace(/\s(?:srcset|sizes|data-[a-z-]+)="[^"]*"/gi, "")
      // Internal links -> root-relative (same paths on the new site)
      .replace(/href="https?:\/\/(?:www\.)?torchdc\.co(\/(?!wp-content)[^"]*)?"/gi, (_, p = "/") => {
        const path = p.length > 1 ? p.replace(/\/(?=$|[?#])/, "") : p;
        return `href="${path}"`;
      })
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function toDoc(post) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const terms = (post._embedded?.["wp:term"] || []).flat();
  const yoast = post.yoast_head_json || {};
  const title = text(post.title.rendered);
  const coverImage = media?.source_url ? originalUrl(media.source_url) : "";
  let content = cleanContent(post.content.rendered);
  // Many posts open with a copy of the cover image (same file, "-1" suffix); the page already shows the cover
  const stem = (u) => u.split("/").pop().replace(/\.[^.]+$/, "").replace(/(-\d+x\d+)?(-\d)?$/, "");
  const lead = content.match(/^(?:<figure[^>]*>\s*)?(?:<p>\s*)?<img[^>]*src="([^"]+)"[^>]*>(?:\s*<\/p>)?(?:\s*<figcaption[\s\S]*?<\/figcaption>)?(?:\s*<\/figure>)?\s*/i);
  if (coverImage && lead && IMG_RE.test(lead[1]) && stem(originalUrl(lead[1])) === stem(coverImage)) {
    content = content.slice(lead[0].length);
  }
  IMG_RE.lastIndex = 0;
  // WordPress built most excerpts from the content, so they start with the (removed) H1 title
  let excerpt = text(post.excerpt.rendered);
  if (excerpt.startsWith(title)) excerpt = excerpt.slice(title.length).trim();
  const words = text(content).split(" ").length;
  return {
    title,
    slug: post.slug,
    excerpt,
    content,
    coverImage,
    author: post._embedded?.author?.[0]?.name || "Torch Team",
    category: terms.find((t) => t.taxonomy === "category")?.name || "Cannabis Education",
    tags: terms.filter((t) => t.taxonomy === "post_tag").map((t) => text(t.name)),
    readTimeMinutes: Math.max(1, Math.round(words / 200)),
    isPublished: post.status === "publish",
    publishedAt: new Date(`${post.date_gmt}Z`),
    seo: {
      metaTitle: yoast.title ? decode(yoast.title) : "",
      metaDescription: yoast.description ? decode(yoast.description) : "",
    },
  };
}

async function main() {
  console.log(WRITE ? "WRITE MODE: uploading images and upserting posts" : "DRY RUN (pass --write to apply)");
  const [posts, sitemapSlugs] = await Promise.all([fetchPosts(), fetchSitemapSlugs()]);
  const docs = posts.map(toDoc);

  await mongoose.connect(mongoUri);
  const existing = new Set((await Blog.find({ slug: { $in: docs.map((d) => d.slug) } }).select("slug").lean()).map((b) => b.slug));

  const images = new Set();
  for (const d of docs) {
    if (d.coverImage) images.add(d.coverImage);
    for (const m of d.content.match(IMG_RE) || []) images.add(originalUrl(m));
  }

  const slugs = new Set(docs.map((d) => d.slug));
  console.log(`Posts from WordPress API: ${docs.length} (sitemap lists ${sitemapSlugs.length})`);
  console.log(`  missing from API but in sitemap: ${sitemapSlugs.filter((s) => !slugs.has(s)).join(", ") || "none"}`);
  console.log(`  new: ${docs.length - existing.size}, already in DB (will be updated): ${existing.size}`);
  console.log(`  unpublished on WP: ${docs.filter((d) => !d.isPublished).length}`);
  console.log(`  images to put on Cloudinary: ${images.size} (covers ${docs.filter((d) => d.coverImage).length}, plus inline)`);
  console.log(`  posts missing meta description: ${docs.filter((d) => !d.seo.metaDescription).length}`);
  for (const d of docs) {
    console.log(`  ${existing.has(d.slug) ? "update" : "new   "} /${d.slug}  "${d.title}"  ${d.publishedAt.toISOString().slice(0, 10)}  ${d.readTimeMinutes}min`);
  }

  if (!WRITE) {
    await mongoose.disconnect();
    return;
  }

  // Upload images (4 at a time), then point posts at the Cloudinary copies
  const queue = [...images];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) await uploadImage(queue.shift());
  }));
  console.log(`Images uploaded: ${images.size - failedUploads.length}/${images.size}`);
  for (const f of failedUploads) console.warn(`  failed: ${f}`);

  for (const d of docs) {
    if (d.coverImage) d.coverImage = uploaded.get(d.coverImage) || d.coverImage;
    d.content = d.content
      .replace(/<img[^>]*>/gi, (tag) => {
        const src = tag.match(IMG_RE)?.[0];
        return src && uploaded.get(originalUrl(src)) === null ? "" : tag;
      })
      // Inline images: resized, auto-format Cloudinary delivery URLs
      .replace(IMG_RE, (m) => uploaded.get(originalUrl(m))?.replace("/image/upload/", "/image/upload/c_limit,w_1200,f_auto,q_auto/") || m);
    await Blog.updateOne({ slug: d.slug }, { $set: d, $setOnInsert: { featured: false } }, { upsert: true });
  }
  console.log(`Upserted ${docs.length} posts.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
