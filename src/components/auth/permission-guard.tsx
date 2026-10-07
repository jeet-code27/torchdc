"use client";

import * as React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionKey } from "@/types";
import { UnauthorizedCard } from "./unauthorized-card";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <UnauthorizedCard permission={permission} />;
  }

  return <>{children}</>;
}
