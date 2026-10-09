import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import "@/models/Role"; // Ensure Role model is registered in Mongoose schema cache

const loginSchema = z.object({
  email: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await connectToDatabase();

        const identifier = email.trim();
        const digitsOnly = identifier.replace(/\D/g, "");

        // Allow login by email or phone number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {
          isDeleted: false,
          isActive: true,
        };

        if (identifier.includes("@")) {
          query.email = identifier.toLowerCase();
        } else if (digitsOnly.length >= 7) {
          query.$or = [
            { phone: identifier },
            { phone: digitsOnly },
            { phone: digitsOnly.slice(-10) },
          ];
        } else {
          query.email = identifier.toLowerCase();
        }

        // Use .lean() to ensure plain JS objects are returned, preventing DataCloneError
        const user = await User.findOne(query)
          .select("+passwordHash")
          .populate("role")
          .lean();

        if (!user || !user.passwordHash || !user.role) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        const roleObj = user.role as {
          key: string;
          permissions?: string[];
        };

        const safePermissions = Array.isArray(roleObj.permissions)
          ? Array.from(roleObj.permissions).map((p) => String(p))
          : [];

        return {
          id: String(user._id),
          name: String(user.name),
          email: String(user.email),
          phone: user.phone ? String(user.phone) : undefined,
          role: String(roleObj.key),
          permissions: safePermissions,
        };
      },
    }),
  ],
});
