"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  roleId: z.string().min(1, "Please select a role"),
  isActive: z.boolean(),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
    key: string;
    isSystem: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export interface RoleOption {
  _id: string;
  name: string;
  key: string;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffToEdit?: StaffMember | null;
  roles: RoleOption[];
  onSuccess: () => void;
}

export function StaffDialog({
  open,
  onOpenChange,
  staffToEdit,
  roles,
  onSuccess,
}: StaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditing = Boolean(staffToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (staffToEdit) {
      reset({
        name: staffToEdit.name,
        email: staffToEdit.email,
        password: "",
        roleId: staffToEdit.role?._id || "",
        isActive: staffToEdit.isActive,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        roleId: roles[0]?._id || "",
        isActive: true,
      });
    }
  }, [staffToEdit, roles, reset, open]);

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);

    const promise = (async () => {
      const url = isEditing
        ? `/api/admin/staff/${staffToEdit?._id}`
        : "/api/admin/staff";
      const method = isEditing ? "PUT" : "POST";

      const payload = isEditing
        ? {
            name: data.name,
            email: data.email,
            roleId: data.roleId,
            isActive: data.isActive,
          }
        : {
            name: data.name,
            email: data.email,
            password: data.password || "TorchStaff123!",
            roleId: data.roleId,
            isActive: data.isActive,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Failed to save staff member");
      }

      onSuccess();
      onOpenChange(false);
      return resData;
    })();

    toast.promise(promise, {
      loading: isEditing ? "Updating staff member..." : "Creating staff account...",
      success: isEditing
        ? "Staff member updated successfully"
        : "Staff account created successfully",
      error: (err) => err.message || "Failed to save staff account",
    });

    try {
      await promise;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register("name")}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? "border-destructive" : "border-border"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. j.doe@torch.com"
              {...register("email")}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? "border-destructive" : "border-border"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password (Only when adding) */}
          {!isEditing && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Initial Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                {...register("password")}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.password ? "border-destructive" : "border-border"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Assign Role
            </label>
            <select
              {...register("roleId")}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.roleId ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">Select a role...</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.key})
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="text-xs text-destructive">
                {errors.roleId.message}
              </p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="isActive"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              Account Active (able to sign in)
            </label>
          </div>

          <DialogFooter className="pt-4">
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
              {isEditing ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
