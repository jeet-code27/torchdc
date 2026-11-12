import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { SitePage } from "@/models/SitePage";
import { Blog } from "@/models/Blog";
import { ActivityLog } from "@/models/ActivityLog";
import { SITE_PAGES_TAG } from "@/lib/site-pages";
import { cleanPageHtml } from "@/lib/page-html";
import { EDITABLE_PAGES, EDITABLE_PAGE_BY_KEY, builtInCopy, slugProblem } from "@/lib/site-pages-admin";
import { LOCATION_PAGES } from "@/lib/location-pages";

export const dynamic = "force-dynamic";

const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const STATES = ["DC", "MD", "VA"];

function cleanFaq(input: unknown) {
  return (Array.isArray(input) ? input : [])
    .slice(0, 60)
    .map((f) => ({ q: clip((f as Record<string, unknown>)?.q, 300), a: cleanPageHtml(clip((f as Record<string, unknown>)?.a, 3000)) }))
    .filter((f) => f.q && f.a);
}

/** Pages show the change on the next visit (and new pages join the sitemap and lists) */
function refresh(path: string) {
  revalidateTag(SITE_PAGES_TAG, { expire: 0 });
  try {
    revalidatePath(path);
    revalidatePath("/sitemap.xml");
  } catch {
    // nothing else to refresh
  }
}

async function log(perm: { user: { userId?: string; name?: string; email?: string; role?: string } }, description: string) {
  try {
    const u = perm.user;
    await ActivityLog.create({
      action: "pages.update",
      description,
      actor: { userId: u.userId, name: u.name || "Admin", email: u.email || "unknown", role: u.role || "admin" },
      entityType: "system",
    });
  } catch (err) {
    console.error("[pages] activity log failed", err);
  }
}

function customOut(d: Record<string, unknown>) {
  return {
    key: d.key,
    slug: d.slug,
    name: d.name,
    state: d.state,
    title: d.title,
    description: d.description,
    body: d.body,
    isPublished: Boolean(d.isPublished),
    updatedAt: d.updatedAt,
  };
}

/**
 * GET /api/admin/pages             - page list (built-in pages with "edited" flags, new neighborhood pages)
 * GET /api/admin/pages?key=<key>   - one page: built-in copy and what's saved
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("seo.view");
  if (!perm.authorized) return perm.response;
  try {
    await connectToDatabase();
    const key = req.nextUrl.searchParams.get("key");
    if (key) {
      const doc = await SitePage.findOne({ key }).lean();
      if (doc?.custom) return NextResponse.json({ success: true, custom: customOut(doc as unknown as Record<string, unknown>) });
      const page = EDITABLE_PAGE_BY_KEY[key];
      if (!page) return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
      return NextResponse.json({
        success: true,
        page,
        builtIn: builtInCopy(key),
        saved: doc ? { body: doc.body || "", chips: doc.chips || [], faq: doc.faq || [], updatedAt: doc.updatedAt } : null,
      });
    }

    const docs = await SitePage.find({}).select("key custom slug name state title isPublished updatedAt body chips faq").lean();
    const edited = new Map(
      docs.filter((d) => !d.custom && (d.body?.trim() || d.chips?.length || d.faq?.length)).map((d) => [d.key, d.updatedAt])
    );
    return NextResponse.json({
      success: true,
      pages: EDITABLE_PAGES.map((p) => ({ ...p, edited: edited.has(p.key), updatedAt: edited.get(p.key) || null })),
      custom: docs
        .filter((d) => d.custom)
        .map((d) => ({ key: d.key, slug: d.slug, name: d.name, state: d.state, isPublished: d.isPublished, updatedAt: d.updatedAt })),
      // Existing neighborhood pages, to start a new page from one of them
      templates: LOCATION_PAGES.filter((p) => p.kind === "area").map((p) => ({ key: `area:${p.slug}`, name: p.name, state: p.state })),
    });
  } catch (error) {
    console.error("GET /api/admin/pages error:", error);
    return NextResponse.json({ success: false, error: "Failed to load pages" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/pages
 * Built-in page: { key, body, chips?, faq? }  (empty body / chips / faq: back to the built-in copy)
 * New neighborhood page: { key, slug?, name, state, title, description, body, isPublished }
 */
export async function PUT(req: NextRequest) {
  const perm = await requirePermission("seo.manage");
  if (!perm.authorized) return perm.response;
  try {
    const body = await req.json().catch(() => ({}));
    const key = clip(body.key, 140);
    await connectToDatabase();
    const existing = await SitePage.findOne({ key });

    if (existing?.custom) {
      const name = clip(body.name, 80);
      const state = clip(body.state, 2);
      const html = cleanPageHtml(clip(body.body, 200_000));
      if (!name) return NextResponse.json({ success: false, error: "Neighborhood name is required" }, { status: 400 });
      if (!STATES.includes(state)) return NextResponse.json({ success: false, error: "Pick DC, Maryland or Virginia" }, { status: 400 });
      if (!html) return NextResponse.json({ success: false, error: "Page text is required" }, { status: 400 });
      const oldSlug = existing.slug;
      const slug = body.slug !== undefined ? clip(body.slug, 100).toLowerCase() : oldSlug;
      if (slug !== oldSlug) {
        const problem = slugProblem(slug);
        if (problem) return NextResponse.json({ success: false, error: problem }, { status: 400 });
        if (await SitePage.exists({ key: `area:${slug}` })) {
          return NextResponse.json({ success: false, error: `/${slug} is already used by another page` }, { status: 409 });
        }
        if (await Blog.exists({ slug })) {
          return NextResponse.json({ success: false, error: `/${slug} is already a blog post` }, { status: 409 });
        }
        existing.key = `area:${slug}`;
        existing.slug = slug;
      }
      existing.name = name;
      existing.state = state as "DC" | "MD" | "VA";
      existing.title = clip(body.title, 120);
      existing.description = clip(body.description, 320);
      existing.body = html;
      existing.isPublished = body.isPublished === true;
      existing.updatedBy = perm.user.email || "";
      await existing.save();
      refresh(`/${slug}`);
      if (slug !== oldSlug) refresh(`/${oldSlug}`);
      await log(perm, `Updated neighborhood page /${slug}${existing.isPublished ? "" : " (hidden)"}`);
      return NextResponse.json({ success: true, custom: customOut(existing.toObject() as unknown as Record<string, unknown>) });
    }

    const page = EDITABLE_PAGE_BY_KEY[key];
    if (!page) return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    const builtIn = builtInCopy(key)!;
    let html = cleanPageHtml(clip(body.body, 200_000));
    // Text equal to the built-in copy is saved as "nothing set", so the page keeps following it
    if (html === builtIn.body.trim()) html = "";
    const chips = page.kind === "home" ? (Array.isArray(body.chips) ? body.chips : []).map((c: unknown) => clip(c, 60)).filter(Boolean).slice(0, 12) : [];
    let faq = page.kind === "home" ? cleanFaq(body.faq) : [];
    const chipsSame = chips.length === builtIn.chips.length && chips.every((c: string, i: number) => c === builtIn.chips[i]);
    const faqSame = faq.length === builtIn.faq.length && faq.every((f, i) => f.q === builtIn.faq[i].q && f.a === builtIn.faq[i].a);
    if (faqSame) faq = [];

    await SitePage.updateOne(
      { key },
      { $set: { body: html, chips: chipsSame ? [] : chips, faq, custom: false, updatedBy: perm.user.email || "" }, $setOnInsert: { key } },
      { upsert: true }
    );
    refresh(page.path);
    const reset = !html && (chipsSame || !chips.length) && !faq.length;
    await log(perm, reset ? `Reset page text: ${page.label}` : `Updated page text: ${page.label}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/admin/pages error:", error);
    return NextResponse.json({ success: false, error: "Failed to save the page" }, { status: 500 });
  }
}

/** POST /api/admin/pages - new neighborhood page { slug, name, state, title, description, body, isPublished } */
export async function POST(req: NextRequest) {
  const perm = await requirePermission("seo.manage");
  if (!perm.authorized) return perm.response;
  try {
    const body = await req.json().catch(() => ({}));
    const slug = clip(body.slug, 100).toLowerCase();
    const name = clip(body.name, 80);
    const state = clip(body.state, 2);
    const html = cleanPageHtml(clip(body.body, 200_000));
    const problem = slugProblem(slug);
    if (problem) return NextResponse.json({ success: false, error: problem }, { status: 400 });
    if (!name) return NextResponse.json({ success: false, error: "Neighborhood name is required" }, { status: 400 });
    if (!STATES.includes(state)) return NextResponse.json({ success: false, error: "Pick DC, Maryland or Virginia" }, { status: 400 });
    if (!html) return NextResponse.json({ success: false, error: "Page text is required" }, { status: 400 });

    await connectToDatabase();
    if (await SitePage.exists({ key: `area:${slug}` })) {
      return NextResponse.json({ success: false, error: `/${slug} is already used by another page` }, { status: 409 });
    }
    if (await Blog.exists({ slug })) {
      return NextResponse.json({ success: false, error: `/${slug} is already a blog post` }, { status: 409 });
    }
    const doc = await SitePage.create({
      key: `area:${slug}`,
      custom: true,
      slug,
      name,
      state: state as "DC" | "MD" | "VA",
      title: clip(body.title, 120),
      description: clip(body.description, 320),
      body: html,
      isPublished: body.isPublished === true,
      updatedBy: perm.user.email || "",
    });
    refresh(`/${slug}`);
    await log(perm, `Created neighborhood page /${slug}${doc.isPublished ? "" : " (hidden)"}`);
    return NextResponse.json({ success: true, custom: customOut(doc.toObject() as unknown as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/pages error:", error);
    return NextResponse.json({ success: false, error: "Failed to create the page" }, { status: 500 });
  }
}

/** DELETE /api/admin/pages?key=<key> - deletes a new neighborhood page */
export async function DELETE(req: NextRequest) {
  const perm = await requirePermission("seo.manage");
  if (!perm.authorized) return perm.response;
  try {
    const key = req.nextUrl.searchParams.get("key") || "";
    await connectToDatabase();
    const doc = await SitePage.findOne({ key, custom: true });
    if (!doc) return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    await doc.deleteOne();
    refresh(`/${doc.slug}`);
    await log(perm, `Deleted neighborhood page /${doc.slug}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/pages error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete the page" }, { status: 500 });
  }
}
