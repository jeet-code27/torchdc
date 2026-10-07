"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Shield,
  Plus,
  MoreHorizontal,
  KeyRound,
  Edit,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { Can } from "@/components/auth/can";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StaffDialog, StaffMember, RoleOption } from "@/components/admin/staff/staff-dialog";
import { ResetPasswordDialog } from "@/components/admin/staff/reset-password-dialog";
import { RoleEditDialog, RoleData } from "@/components/admin/roles/role-edit-dialog";

export default function StaffAndRolesPage() {
  const { hasPermission } = usePermissions();

  // Active view tab: "staff" | "roles"
  const [activeTab, setActiveTab] = React.useState<"staff" | "roles">("staff");

  // Staff state
  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [roles, setRoles] = React.useState<RoleData[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = React.useState(true);

  // Dialog states
  const [staffDialogOpen, setStaffDialogOpen] = React.useState(false);
  const [staffToEdit, setStaffToEdit] = React.useState<StaffMember | null>(null);

  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [staffToReset, setStaffToReset] = React.useState<StaffMember | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [staffToDelete, setStaffToDelete] = React.useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null);

  const fetchStaff = React.useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch("/api/admin/staff");
      const json = await res.json();
      if (json.success) {
        setStaffList(json.data || []);
      }
    } catch {
      toast.error("Failed to load staff list");
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  const fetchRoles = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.success) {
        setRoles(json.data || []);
      }
    } catch {
      toast.error("Failed to load roles");
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [fetchStaff, fetchRoles]);

  // Quick toggle active state
  const handleToggleActive = async (member: StaffMember) => {
    if (member.role?.key === "super_admin") {
      toast.error("Super Admin accounts cannot be deactivated");
      return;
    }

    const newStatus = !member.isActive;
    const promise = (async () => {
      const res = await fetch(`/api/admin/staff/${member._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          roleId: member.role._id,
          isActive: newStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      await fetchStaff();
      return data;
    })();

    toast.promise(promise, {
      loading: "Updating status...",
      success: `${member.name} is now ${newStatus ? "Active" : "Deactivated"}`,
      error: (err) => err.message,
    });
  };

  // Delete staff member
  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    if (staffToDelete.role?.key === "super_admin") {
      toast.error("Super Admin accounts cannot be deleted");
      return;
    }

    setIsDeleting(true);

    const promise = (async () => {
      const res = await fetch(`/api/admin/staff/${staffToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete staff member");
      }
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
      await fetchStaff();
      return data;
    })();

    toast.promise(promise, {
      loading: "Removing staff account...",
      success: "Staff member deleted successfully",
      error: (err) => err.message,
    });

    try {
      await promise;
    } finally {
      setIsDeleting(false);
    }
  };

  // Staff Table Columns
  const columns: ColumnDef<StaffMember>[] = [
    {
      accessorKey: "name",
      header: "Staff Member",
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>{item.name}</span>
                {item.role?.key === "super_admin" && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-primary/10 text-primary border border-primary/20">
                    Root
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">{item.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Assigned Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const isSuper = role?.key === "super_admin";
        const isAdmin = role?.key === "admin";

        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted/40 border-border">
            <Shield
              className={`w-3 h-3 ${
                isSuper
                  ? "text-primary"
                  : isAdmin
                  ? "text-blue-500"
                  : "text-purple-500"
              }`}
            />
            <span className="text-foreground capitalize">{role?.name || "No Role"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <StatusBadge variant={active ? "success" : "muted"} dot>
            {active ? "Active" : "Deactivated"}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-[11px] text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        const isSuperAdmin = member.role?.key === "super_admin";

        return (
          <Can permission="staff.manage">
            <div className="flex justify-end pr-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Staff actions menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      setStaffToEdit(member);
                      setStaffDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                    <span>Edit Profile & Role</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setStaffToReset(member);
                      setResetDialogOpen(true);
                    }}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                    <span>Reset Password</span>
                  </DropdownMenuItem>

                  {!isSuperAdmin && (
                    <DropdownMenuItem onClick={() => handleToggleActive(member)}>
                      {member.isActive ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-amber-500 mr-1" />
                          <span>Deactivate Account</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                          <span>Activate Account</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  )}

                  {!isSuperAdmin && <DropdownMenuSeparator />}

                  {!isSuperAdmin ? (
                    <DropdownMenuItem
                      onClick={() => {
                        setStaffToDelete(member);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete Staff</span>
                    </DropdownMenuItem>
                  ) : (
                    <div className="px-2 py-1.5 text-[10px] text-muted-foreground flex items-center gap-1 border-t border-border mt-1">
                      <Lock className="w-3 h-3 text-primary" />
                      <span>Protected Super Admin</span>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Can>
        );
      },
    },
  ];

  return (
    <PermissionGuard permission="staff.view">
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* Page Header */}
        <PageHeader
          title="Staff & Roles"
          description="Manage TORCH team members, role assignments, and permission matrices."
          actions={
            <Can permission="staff.manage">
              <Button
                onClick={() => {
                  setStaffToEdit(null);
                  setStaffDialogOpen(true);
                }}
                className="text-xs"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Staff Member</span>
              </Button>
            </Can>
          }
        />

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "staff"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "roles"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions ({roles.length})</span>
          </button>
        </div>

        {/* TAB 1: Staff Directory */}
        {activeTab === "staff" && (
          <div className="space-y-4">
            <DataTable
              columns={columns}
              data={staffList}
              searchKey="name"
              searchPlaceholder="Search staff by name..."
              isLoading={isLoadingStaff}
              emptyMessage="No staff members found. Add one above."
            />
          </div>
        )}

        {/* TAB 2: Roles & Permissions */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Role-Based Access Control</span>
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Role Definitions & Permission Checkboxes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Super Admin role has permanent, unchangeable access to all modules.
                  Other roles (Administrator, SEO Specialist, etc.) can be configured with specific permission checkboxes.
                </p>
              </div>

              {!hasPermission("roles.manage") && (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Super Admin permission required to edit roles</span>
                </div>
              )}
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {roles.map((role) => {
                const isSuper = role.key === "super_admin";
                const isAdmin = role.key === "admin";

                return (
                  <div
                    key={role._id}
                    className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              isSuper
                                ? "bg-primary/10 text-primary"
                                : isAdmin
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-purple-500/10 text-purple-500"
                            }`}
                          >
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">
                              {role.name}
                            </h3>
                            <span className="font-mono text-[10px] text-muted-foreground block">
                              key: {role.key}
                            </span>
                          </div>
                        </div>

                        {isSuper ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Permanent
                          </span>
                        ) : role.isSystem ? (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            System
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span>Granted Permissions:</span>
                          <span className="font-semibold text-foreground">
                            {isSuper ? "All (34 modules)" : `${role.permissions.length} modules`}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{
                              width: isSuper
                                ? "100%"
                                : `${Math.min(
                                    100,
                                    (role.permissions.length / 34) * 100
                                  )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      {isSuper ? (
                        <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-muted/60 text-muted-foreground text-xs font-medium border border-border">
                          <Lock className="w-3.5 h-3.5 text-primary" />
                          <span>Protected (All Permissions)</span>
                        </div>
                      ) : (
                        <Can
                          permission="roles.manage"
                          fallback={
                            <Button
                              variant="outline"
                              disabled
                              className="w-full text-xs"
                            >
                              <Lock className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                              <span>View Only</span>
                            </Button>
                          }
                        >
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRole(role);
                              setRoleDialogOpen(true);
                            }}
                            className="w-full text-xs hover:border-primary hover:text-primary transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span>Edit Permission Checkboxes</span>
                          </Button>
                        </Can>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dialog 1: Create / Edit Staff Member */}
        <StaffDialog
          open={staffDialogOpen}
          onOpenChange={setStaffDialogOpen}
          staffToEdit={staffToEdit}
          roles={
            // Filter roles for dropdown: staff can be assigned to roles
            roles as unknown as RoleOption[]
          }
          onSuccess={fetchStaff}
        />

        {/* Dialog 2: Reset Staff Password */}
        <ResetPasswordDialog
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
          staffMember={staffToReset}
        />

        {/* Dialog 3: Delete Staff Confirmation */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Staff Member"
          description={`Are you sure you want to deactivate and remove ${staffToDelete?.name}? This action soft-deletes the user record.`}
          confirmText="Delete Staff"
          variant="destructive"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />

        {/* Dialog 4: Edit Role Permissions Matrix (Only for non-super_admin roles) */}
        <RoleEditDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          role={selectedRole}
          onSuccess={() => {
            fetchRoles();
            fetchStaff();
          }}
        />
      </div>
    </PermissionGuard>
  );
}
