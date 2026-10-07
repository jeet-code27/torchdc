import { requirePermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await requirePermission("dashboard.view");
  if (!authResult.authorized) {
    return authResult.response;
  }

  return NextResponse.json({
    success: true,
    data: {
      message: "Authorized access to dashboard telemetry",
      user: {
        id: authResult.user.userId,
        name: authResult.user.name,
        email: authResult.user.email,
        role: authResult.user.role,
        permissionsCount: authResult.user.permissions.length,
      },
    },
  });
}
