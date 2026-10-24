import type { AuthContext } from "@/lib/permissions";

/** Same rule the existing /api/admin/orders routes use. */
export function canViewOrders(user: AuthContext) {
  return (
    ["super_admin", "admin", "store_manager"].includes(user.role) ||
    user.permissions.includes("*") ||
    user.permissions.includes("orders.view") ||
    user.permissions.includes("orders.manage")
  );
}

export function canEditOrders(user: AuthContext) {
  return (
    ["super_admin", "admin", "store_manager"].includes(user.role) ||
    user.permissions.includes("*") ||
    user.permissions.includes("orders.edit") ||
    user.permissions.includes("orders.manage")
  );
}
