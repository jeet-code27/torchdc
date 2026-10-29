import type { NextAuthConfig } from "next-auth";

/**
 * Every role except "customer" is a staff role that may open the admin (super_admin, admin,
 * seo, or any role made in Staff & Roles). What each one can see and change is still decided by
 * the role's permissions.
 */
export function isStaffRole(role: unknown) {
  const key = String(role || "").trim().toLowerCase();
  return key !== "" && key !== "customer";
}

/**
 * Public origin of the site. Behind a reverse proxy (Nginx on the VPS) the request URL is the app's
 * internal address (e.g. https://localhost:3009), so prefer SITE_URL, then the proxy's forwarded headers.
 */
function publicOrigin(request: Request, fallback: URL): string {
  // SITE_URL only in production, so local `npm run dev` keeps redirecting to localhost
  const site = process.env.NODE_ENV === "production" ? process.env.SITE_URL?.trim().replace(/\/$/, "") : "";
  if (site) return site;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (host) {
    const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "https";
    return `${proto}://${host}`;
  }
  return fallback.origin;
}

function publicRedirect(request: Request, fallback: URL, path: string): Response {
  return Response.redirect(new URL(path, publicOrigin(request, fallback)), 307);
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const userRole = (auth?.user?.role || "").toLowerCase();
      const isAdminStaff = isStaffRole(userRole);
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/admin/login";

      if (isOnLogin) {
        if (isLoggedIn && isAdminStaff) {
          return publicRedirect(request, nextUrl, "/admin");
        }
        return true;
      }

      if (isOnAdmin) {
        if (isLoggedIn && isAdminStaff) return true;
        // Send to login and come back to this exact admin page afterwards (e.g. an order link from an email)
        return publicRedirect(
          request,
          nextUrl,
          `/admin/login?callbackUrl=${encodeURIComponent(nextUrl.pathname + nextUrl.search)}`
        );
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.role = String(user.role);
        token.phone = user.phone ? String(user.phone) : undefined;
        token.permissions = Array.isArray(user.permissions)
          ? Array.from(user.permissions).map((p) => String(p))
          : [];
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = String(token.id || token.sub);
        session.user.role = String(token.role || "customer");
        session.user.phone = token.phone ? String(token.phone) : undefined;
        session.user.permissions = Array.isArray(token.permissions)
          ? Array.from(token.permissions).map((p) => String(p))
          : [];
      }
      return session;
    },
  },
  providers: [],
};
