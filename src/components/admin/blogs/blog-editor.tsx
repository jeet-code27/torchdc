"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye, Code2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string;
  readTimeMinutes: number;
  isPublished: boolean;
  featured: boolean;
  seo: { metaTitle: string; metaDescription: string; focusKeyword: string };
}

const EMPTY: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Torch Team",
  category: "Cannabis Education",
  tags: "",
  readTimeMinutes: 4,
  isPublished: false,
  featured: false,
  seo: { metaTitle: "", metaDescription: "", focusKeyword: "" },
};

const CATEGORIES = ["Cannabis Education", "Cannabis", "Strain Spotlight", "DC Culture & Lifestyle", "Product Reviews"];

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
const labelCls = "text-xs font-semibold text-foreground";

const toSlug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Full-page create / edit form for a blog post (posts are served at the site root: /<slug>). */
export function BlogEditor({ blogId }: { blogId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(blogId);
  const [form, setForm] = React.useState<BlogForm>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(isEdit);
  const [isSaving, setIsSaving] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [savedSlug, setSavedSlug] = React.useState("");

  React.useEffect(() => {
    if (!blogId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/blogs/${blogId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        const b = data.blog;
        setForm({
          title: b.title || "",
          slug: b.slug || "",
          excerpt: b.excerpt || "",
          content: b.content || "",
          coverImage: b.coverImage || "",
          author: b.author || "Torch Team",
          category: b.category || "Cannabis Education",
          tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
          readTimeMinutes: b.readTimeMinutes || 4,
          isPublished: Boolean(b.isPublished),
          featured: Boolean(b.featured),
          seo: {
            metaTitle: b.seo?.metaTitle || "",
            metaDescription: b.seo?.metaDescription || "",
            focusKeyword: b.seo?.focusKeyword || "",
          },
        });
        setSavedSlug(b.isPublished ? b.slug : "");
      } catch (err) {
        toast.error((err as Error).message || "Failed to load article");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [blogId]);

  const set = <K extends keyof BlogForm>(key: K, value: BlogForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const setSeo = (key: keyof BlogForm["seo"], value: string) =>
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.content) {
      toast.error("Title, slug and content are required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/blogs/${blogId}` : "/api/admin/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(isEdit ? "Article saved" : "Article created");
      if (isEdit) {
        setForm((prev) => ({ ...prev, slug: data.blog.slug }));
        setSavedSlug(data.blog.isPublished ? data.blog.slug : "");
      } else {
        router.replace(`/admin/blogs/${data.blog._id}`);
      }
    } catch (err) {
      toast.error((err as Error).message || "Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading article...
      </div>
    );
  }

  const metaTitle = form.seo.metaTitle || form.title;
  const metaDescription = form.seo.metaDescription || form.excerpt;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1 min-w-0">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All articles
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
            {isEdit ? form.title || "Edit Article" : "Write New Article"}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {savedSlug && (
            <a
              href={`/${savedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View live
            </a>
          )}
          <Button type="submit" disabled={isSaving} className="text-xs font-medium">
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <label className={labelCls}>Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: isEdit ? prev.slug : toSlug(e.target.value),
                }))
              }
              className={`${inputCls} text-base font-semibold`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>URL slug *</label>
            <div className="flex items-center rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
              <span className="pl-3 text-sm text-muted-foreground select-none">torchdc.co/</span>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="flex-1 min-w-0 px-1 py-2 text-sm font-mono bg-transparent text-foreground focus:outline-none"
              />
            </div>
            {isEdit && (
              <p className="text-[11px] text-muted-foreground">
                Changing the slug changes the post URL. Add a redirect in SEO → Redirects so old links keep working.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Excerpt</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short summary shown on the blog list and in search results"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Content (HTML) *</label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${!preview ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md ${preview ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>
            {preview ? (
              <div
                className="blog-preview min-h-[480px] max-h-[75vh] overflow-y-auto rounded-lg border border-border bg-background px-5 py-4 text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            ) : (
              <textarea
                required
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className={`${inputCls} min-h-[480px] font-mono text-xs leading-relaxed`}
              />
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Publishing</h2>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="accent-[#5A805B] w-4 h-4"
              />
              Published (visible on website)
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="accent-[#5A805B] w-4 h-4"
              />
              Featured
            </label>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Cover image</h2>
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="" className="w-full aspect-video object-cover rounded-lg border border-border" />
            )}
            <input
              type="url"
              placeholder="https://res.cloudinary.com/..."
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              className={inputCls}
            />
          </section>

          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Details</h2>
            <div className="space-y-1.5">
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {[...new Set([form.category, ...CATEGORIES])].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelCls}>Author</label>
                <input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className={labelCls}>Read time (min)</label>
                <input
                  type="number"
                  min={1}
                  value={form.readTimeMinutes}
                  onChange={(e) => set("readTimeMinutes", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h2 className="text-sm font-bold text-foreground">SEO</h2>
            <div className="space-y-1.5">
              <label className={labelCls}>Meta title</label>
              <input
                type="text"
                value={form.seo.metaTitle}
                placeholder={form.title}
                onChange={(e) => setSeo("metaTitle", e.target.value)}
                className={inputCls}
              />
              <p className={`text-[11px] ${metaTitle.length > 60 ? "text-amber-600" : "text-muted-foreground"}`}>
                {metaTitle.length}/60 characters
              </p>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Meta description</label>
              <textarea
                rows={3}
                value={form.seo.metaDescription}
                placeholder={form.excerpt}
                onChange={(e) => setSeo("metaDescription", e.target.value)}
                className={inputCls}
              />
              <p className={`text-[11px] ${metaDescription.length > 160 ? "text-amber-600" : "text-muted-foreground"}`}>
                {metaDescription.length}/160 characters
              </p>
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>Focus keyword</label>
              <input
                type="text"
                value={form.seo.focusKeyword}
                onChange={(e) => setSeo("focusKeyword", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="rounded-lg border border-border bg-background p-3 space-y-0.5">
              <p className="text-[11px] text-muted-foreground">torchdc.co/{form.slug}</p>
              <p className="text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] line-clamp-1">{metaTitle || "Title"}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{metaDescription || "Description"}</p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
