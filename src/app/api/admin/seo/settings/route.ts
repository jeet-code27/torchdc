import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { SeoSettings } from "@/models/SeoSettings";
import { ActivityLog } from "@/models/ActivityLog";
import { SEO_PAGES, SEO_PAGE_BY_KEY } from "@/lib/seo-pages";
import { SEO_SETTINGS_TAG, cleanVerification } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

async function load() {
  await connectToDatabase();
  const doc = await SeoSettings.findOne({ key: "default" }).lean();
  const pages = doc?.pages instanceof Map ? Object.fromEntries(doc.pages) : doc?.pages || {};
  return {
    googleVerification: doc?.googleVerification || "",
    bingVerification: doc?.bingVerification || "",
    defaultShareImage: doc?.defaultShareImage || "",
    pages,
  };
}

// GET /api/admin/seo/settings - search settings + the editable page list with built-in defaults
export async function GET() {
  const perm = await requirePermission("seo.view");
  if (!perm.authorized) return perm.response;
  try {
    return NextResponse.json({ success: true, settings: await load(), pageList: SEO_PAGES });
  } catch (error) {
    console.error("GET /api/admin/seo/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to load SEO settings" }, { status: 500 });
  }
}

const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// PATCH /api/admin/seo/settings - { googleVerification?, bingVerification?, defaultShareImage?, pages?: { [key]: {title, description, noindex} } }
export async function PATCH(req: NextRequest) {
  const perm = await requirePermission("seo.manage");
  if (!perm.authorized) return perm.response;
  try {
    const body = await req.json().catch(() => ({}));
    const set: Record<string, unknown> = {};
    if (body.googleVerification !== undefined) set.googleVerification = cleanVerification(body.googleVerification);
    if (body.bingVerification !== undefined) set.bingVerification = cleanVerification(body.bingVerification);
    if (body.defaultShareImage !== undefined) {
      const img = clip(body.defaultShareImage, 500);
      if (img && !/^(https:\/\/|\/)/.test(img)) {
        return NextResponse.json({ success: false, error: "Share image must be an https:// link or a /path" }, { status: 400 });
      }
      set.defaultShareImage = img;
    }
    const changedPages: string[] = [];
    if (body.pages && typeof body.pages === "object") {
      for (const [key, v] of Object.entries(body.pages as Record<string, Record<string, unknown>>)) {
        if (!SEO_PAGE_BY_KEY[key]) continue;
        set[`pages.${key}`] = { title: clip(v?.title, 120), description: clip(v?.description, 320), noindex: v?.noindex === true };
        changedPages.push(SEO_PAGE_BY_KEY[key].label);
      }
    }
    if (!Object.keys(set).length) {
      return NextResponse.json({ success: false, error: "Nothing to save" }, { status: 400 });
    }

    await connectToDatabase();
    await SeoSettings.updateOne({ key: "default" }, { $set: set, $setOnInsert: { key: "default" } }, { upsert: true });
    // Pages pick up the change on the next visit
    revalidateTag(SEO_SETTINGS_TAG, { expire: 0 });

    try {
      const u = perm.user;
      await ActivityLog.create({
        action: "seo.settings_update",
        description: changedPages.length ? `Updated search titles for: ${changedPages.join(", ")}` : "Updated search verification / share image",
        actor: { userId: u.userId, name: u.name || "Admin", email: u.email || "unknown", role: u.role || "admin" },
        entityType: "system",
      });
    } catch (err) {
      console.error("[seo] activity log failed", err);
    }
    return NextResponse.json({ success: true, settings: await load() });
  } catch (error) {
    console.error("PATCH /api/admin/seo/settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to save SEO settings" }, { status: 500 });
  }
}
