import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import "@/models/Role"; // Ensure Role model is registered in Mongoose schema cache

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await connectToDatabase();

        // Use .lean() to ensure plain JS objects are returned, preventing DataCloneError
        const user = await User.findOne({
          email: email.toLowerCase().trim(),
          isDeleted: false,
          isActive: true,
        })
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
          role: String(roleObj.key),
          permissions: safePermissions,
        };
      },
    }),
  ],
});
