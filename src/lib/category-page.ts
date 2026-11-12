import { connectToDatabase } from "@/lib/db";
import { Category, type ICategoryPage } from "@/models/Category";
import { cleanPageHtml } from "@/lib/page-html";
import { mergeCategoryCopy, type CategoryCopy } from "@/lib/category-content";

/** Copy for a category page: saved on Admin › Categories, else the client's built-in copy (server only). */
export async function getCategoryCopy(slug: string): Promise<CategoryCopy> {
  try {
    await connectToDatabase();
    const doc = await Category.findOne({ slug }).select("page").lean();
    return mergeCategoryCopy(slug, doc?.page as ICategoryPage | undefined);
  } catch {
    return mergeCategoryCopy(slug, null);
  }
}

const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Category page fields from an admin request, cleaned (null when the request has none) */
export function cleanCategoryPage(input: unknown): ICategoryPage | null {
  if (!input || typeof input !== "object") return null;
  const p = input as Record<string, unknown>;
  const faq = Array.isArray(p.faq) ? p.faq : [];
  return {
    label: clip(p.label, 60),
    h1: clip(p.h1, 150),
    intro: cleanPageHtml(clip(p.intro, 4000)),
    faqTitle: clip(p.faqTitle, 120),
    faq: faq
      .slice(0, 40)
      .map((f) => ({ q: clip((f as Record<string, unknown>)?.q, 300), a: cleanPageHtml(clip((f as Record<string, unknown>)?.a, 3000)) }))
      .filter((f) => f.q && f.a),
  };
}
