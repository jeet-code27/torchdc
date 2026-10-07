import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Role } from "@/models/Role";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const hasAccess =
    user.role === "super_admin" ||
    user.permissions.includes("*") ||
    user.permissions.includes("staff.view") ||
    user.permissions.includes("roles.manage");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing permissions to view roles" },
      { status: 403 }
    );
  }

  try {
    await connectToDatabase();
    const roles = await Role.find().sort({ isSystem: -1, createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
