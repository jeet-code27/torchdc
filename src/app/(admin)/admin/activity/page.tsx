"use client";

import { PermissionGuard } from "@/components/auth/permission-guard";

export default function ActivityPlaceholderPage() {
  return (
    <PermissionGuard permission="activity.view">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail of admin and staff actions (scheduled for Step 12).
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card/50">
          <p className="text-sm text-muted-foreground">
            Activity log tracking (who did what, timestamps, IP, entity changes) will be built in Step 12.
          </p>
        </div>
      </div>
    </PermissionGuard>
  );
}
