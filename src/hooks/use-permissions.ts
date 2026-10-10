"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { PermissionKey, ALL_PERMISSIONS, ROLE_PRESETS } from "@/types";

export function usePermissions() {
  const { data: session, status } = useSession();

  const rawRole = (session?.user?.role || "").toLowerCase().trim();
  const rawPermissions = (session?.user?.permissions as string[]) || [];
  const isLoading = status === "loading";

  const isSuperAdmin =
    rawRole === "super_admin" ||
    rawRole === "superadmin" ||
    rawRole === "super administrator";

  const isAdmin = rawRole === "admin" || rawRole === "administrator";

  // Derive resolved permissions: Super Admins always have ALL_PERMISSIONS
  const permissions: string[] = React.useMemo(() => {
    if (isSuperAdmin) {
      return [...ALL_PERMISSIONS];
    }
    if (isAdmin && rawPermissions.length === 0) {
      return [...ROLE_PRESETS.ADMIN.permissions];
    }
    return rawPermissions;
  }, [isSuperAdmin, isAdmin, rawPermissions]);

  const role = isSuperAdmin
    ? "super_admin"
    : isAdmin
    ? "admin"
    : session?.user?.role || "";

  const hasPermission = (permission?: PermissionKey): boolean => {
    if (!permission) return true;
    if (isSuperAdmin) return true;
    if (permissions.includes("*")) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: PermissionKey[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (isSuperAdmin) return true;
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
