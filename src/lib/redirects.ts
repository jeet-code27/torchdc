import { connectToDatabase } from "@/lib/db";
import { Redirect } from "@/models/Redirect";

/** Turns "https://torchdc.co/Old-Page/?x=1" or "old-page/" into "/old-page" for matching. */
export function normalizeRedirectPath(input: string): string {
  let path = String(input || "").trim();
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
  } catch {
    // keep as typed
  }
  path = path.split(/[?#]/)[0].toLowerCase();
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  return path;
}

interface CachedRedirect {
  id: string;
  target: string;
  status: 301 | 302;
}

const TTL_MS = 60_000;
let cache: { at: number; map: Map<string, CachedRedirect> } | null = null;
let loading: Promise<Map<string, CachedRedirect>> | null = null;

async function loadRedirects(): Promise<Map<string, CachedRedirect>> {
  await connectToDatabase();
  const rows = await Redirect.find({ isActive: true }).select("sourceUrl targetUrl statusCode").lean();
  const map = new Map<string, CachedRedirect>();
  for (const r of rows) {
    map.set(normalizeRedirectPath(r.sourceUrl), {
      id: String(r._id),
      target: r.targetUrl,
      status: r.statusCode === 302 ? 302 : 301,
    });
  }
  return map;
}

/**
 * Active admin redirect (Admin → SEO → Redirects) for a path, or null.
 * Rules are cached in memory for a minute so page requests don't each hit the database.
 */
export async function findRedirect(pathname: string): Promise<CachedRedirect | null> {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    if (!loading) {
      loading = loadRedirects()
        .then((map) => {
          cache = { at: Date.now(), map };
          return map;
        })
        .finally(() => {
          loading = null;
        });
    }
    try {
      await loading;
    } catch {
      // Database unreachable: serve the page normally rather than failing the request
      if (!cache) return null;
    }
  }
  const hit = cache?.map.get(normalizeRedirectPath(pathname));
  if (!hit) return null;
  // Count the hit for the admin report; never block the redirect on it
  Redirect.updateOne({ _id: hit.id }, { $inc: { hits: 1 }, $set: { lastAccessedAt: new Date() } }).catch(() => null);
  return hit;
}
