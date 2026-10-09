import type { NextAuthConfig } from "next-auth";

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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname === "/admin/login";

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false;
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
