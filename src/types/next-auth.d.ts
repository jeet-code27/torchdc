import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    phone?: string;
    permissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    phone?: string;
    permissions?: string[];
  }
}
