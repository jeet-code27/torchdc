"use client";

import { useSession } from "next-auth/react";
import { PermissionKey } from "@/types";

export function usePermissions() {
  const { data: session, status } = useSession();

  const role = session?.user?.role || "";
  const permissions = (session?.user?.permissions as string[]) || [];
  const isLoading = status === "loading";

  const hasPermission = (permission?: PermissionKey): boolean => {
    if (!permission) return true;
    if (role === "super_admin") return true;
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: PermissionKey[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (role === "super_admin") return true;
    if (permissions.includes("*")) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  return {
    user: session?.user || null,
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    isLoading,
    isAuthenticated: !!session?.user,
  };
}
