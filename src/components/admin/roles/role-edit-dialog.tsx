"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Lock, CheckSquare, Square } from "lucide-react";
import { PermissionKey } from "@/types";

export interface RoleData {
  _id: string;
  name: string;
  key: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
}

const PERMISSION_MODULES: {
  module: string;
  permissions: { key: PermissionKey; label: string; description?: string }[];
}[] = [
  {
    module: "Dashboard",
    permissions: [
      { key: "dashboard.view", label: "View Dashboard", description: "Access store analytics & stats" },
    ],
  },
  {
    module: "Products & Variants",
    permissions: [
      { key: "products.view", label: "View Products" },
      { key: "products.create", label: "Create Products" },
      { key: "products.edit", label: "Edit Products" },
      { key: "products.delete", label: "Delete Products" },
      { key: "products.seo", label: "Edit Product SEO" },
    ],
  },
  {
    module: "Categories",
    permissions: [
      { key: "categories.view", label: "View Categories" },
      { key: "categories.create", label: "Create Categories" },
      { key: "categories.edit", label: "Edit Categories" },
      { key: "categories.delete", label: "Delete Categories" },
      { key: "categories.seo", label: "Edit Category SEO" },
    ],
  },
  {
    module: "Brands",
    permissions: [
      { key: "brands.view", label: "View Brands" },
      { key: "brands.create", label: "Create Brands" },
      { key: "brands.edit", label: "Edit Brands" },
      { key: "brands.delete", label: "Delete Brands" },
    ],
  },
  {
    module: "Orders & Fulfillment",
    permissions: [
      { key: "orders.view", label: "View Orders", description: "Delivery & Pickup queue" },
      { key: "orders.manage", label: "Manage Orders", description: "Update statuses & collect COD payments" },
    ],
  },
  {
    module: "Deals & Coupons",
    permissions: [
      { key: "deals.view", label: "View Deals & Coupons" },
      { key: "deals.manage", label: "Manage Deals & Coupons" },
    ],
  },
  {
    module: "Customers",
    permissions: [
      { key: "customers.view", label: "View Customer Profiles" },
      { key: "customers.manage", label: "Manage Customers" },
    ],
  },
  {
    module: "Loyalty Program",
    permissions: [
      { key: "loyalty.view", label: "View Loyalty Program" },
      { key: "loyalty.manage", label: "Manage Points & Tiers" },
    ],
  },
  {
    module: "Blogs & Articles",
    permissions: [
      { key: "blogs.view", label: "View Blog Posts" },
      { key: "blogs.create", label: "Create Blog Posts" },
      { key: "blogs.edit", label: "Edit Blog Posts" },
      { key: "blogs.delete", label: "Delete Blog Posts" },
      { key: "blogs.publish", label: "Publish / Unpublish Posts" },
    ],
  },
  {
    module: "SEO Controls",
    permissions: [
      { key: "seo.view", label: "View SEO Module" },
      { key: "seo.manage", label: "Manage Redirects & Metadata" },
    ],
  },
  {
    module: "Staff & Administration",
    permissions: [
      { key: "staff.view", label: "View Staff Directory" },
      { key: "staff.manage", label: "Create, Edit & Reset Staff" },
      { key: "roles.manage", label: "Manage Roles & Permissions" },
    ],
  },
  {
    module: "Audit Trail",
    permissions: [
      { key: "activity.view", label: "View Activity Log" },
    ],
  },
];

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleData | null;
  onSuccess: () => void;
}

export function RoleEditDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleEditDialogProps) {
  const [roleName, setRoleName] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setSelectedPermissions(role.permissions || []);
    }
  }, [role, open]);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const toggleModulePermissions = (permissions: { key: PermissionKey }[]) => {
    const keys = permissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !keys.includes(p as PermissionKey)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...keys])));
    }
  };

  const selectAll = () => {
    const all = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));
    setSelectedPermissions(Array.from(new Set(all)));
  };

  const deselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (!roleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    setIsSubmitting(true);

    const promise = (async () => {
      const res = await fetch(`/api/admin/roles/${role._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName.trim(),
          permissions: selectedPermissions,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to update role");
      }

      onSuccess();
      onOpenChange(false);
      return resData;
    })();

    toast.promise(promise, {
      loading: `Saving role "${role.name}"...`,
      success: `Role "${role.name}" updated with ${selectedPermissions.length} permissions`,
      error: (err) => err.message || "Failed to update role",
    });

    try {
      await promise;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Edit Role & Permissions</DialogTitle>
              <DialogDescription>
                Configure module access for role: <strong>{role?.key}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 pt-2">
          {/* Role Name & Immutable Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Role Display Name
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Role display name"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span>Role Key (Immutable)</span>
              </label>
              <input
                type="text"
                value={role?.key || ""}
                disabled
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Quick Select Actions */}
          <div className="flex items-center justify-between text-xs border-b border-border pb-2">
            <div className="font-semibold text-foreground">
              Permission Matrix ({selectedPermissions.length} enabled)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-primary hover:underline font-medium text-[11px]"
              >
                Select All
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                type="button"
                onClick={deselectAll}
                className="text-muted-foreground hover:text-foreground font-medium text-[11px]"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Categorized Permissions Grid */}
          <div className="space-y-4 max-h-[46vh] overflow-y-auto pr-1">
            {PERMISSION_MODULES.map((group) => {
              const allChecked = group.permissions.every((p) =>
                selectedPermissions.includes(p.key)
              );
              const someChecked =
                !allChecked &&
                group.permissions.some((p) => selectedPermissions.includes(p.key));

              return (
                <div
                  key={group.module}
                  className="rounded-lg border border-border bg-card p-3 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <span className="font-semibold text-xs text-foreground">
                      {group.module}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleModulePermissions(group.permissions)}
                      className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      {allChecked ? (
                        <>
                          <CheckSquare className="w-3 h-3 text-primary" />
                          <span>All</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Toggle</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {group.permissions.map((perm) => {
                      const isChecked = selectedPermissions.includes(perm.key);
                      return (
                        <label
                          key={perm.key}
                          className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs select-none transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            className="w-3.5 h-3.5 mt-0.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="font-medium text-foreground block leading-tight">
                              {perm.label}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground leading-none">
                              {perm.key}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              Save Permissions
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
