import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { findRedirect } from "@/lib/redirects";

const { auth } = NextAuth(authConfig);

export async function proxy(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // Admin pages: staff login check (unchanged)
  if (pathname.startsWith("/admin")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (auth as any)(req, event);
  }

  // Storefront: redirects managed in Admin → SEO → Redirects (e.g. old WordPress URLs)
  const hit = await findRedirect(pathname);
  if (hit) {
    const target = /^https?:\/\//i.test(hit.target) ? hit.target : new URL(hit.target, req.url);
    return NextResponse.redirect(target, hit.status);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  // Everything except API routes, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|assets|images|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
