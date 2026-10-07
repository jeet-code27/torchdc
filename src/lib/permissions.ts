import { auth } from "@/auth";
import { PermissionKey } from "@/types";
import { NextResponse } from "next/server";

export interface AuthContext {
  userId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function getCurrentUser(): Promise<AuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    userId: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: session.user.role || "",
    permissions: session.user.permissions || [],
  };
}

/**
 * Server-side permission check for API routes and Server Actions.
 * Returns 401 JSON if not logged in, 403 JSON if permission is missing.
 */
export async function requirePermission(permission: PermissionKey): Promise<
  | { authorized: true; user: AuthContext }
  | { authorized: false; response: NextResponse }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required" },
        { status: 401 }
      ),
    };
  }

  const hasAccess =
    user.role === "super_admin" ||
    user.permissions.includes("*") ||
    user.permissions.includes(permission);

  if (!hasAccess) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Missing required permission "${permission}"`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

export function checkUserPermission(
  userPermissions: string[],
  role: string,
  permission?: PermissionKey
): boolean {
  if (!permission) return true;
  if (role === "super_admin") return true;
  if (userPermissions.includes("*")) return true;
  return userPermissions.includes(permission);
}
