import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Role } from "@/models/Role";
import { updateRoleSchema } from "@/lib/validations/role";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only users with roles.manage (Super Admin) can edit roles
  const authCheck = await requirePermission("roles.manage");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { name, permissions } = parsed.data;

    await connectToDatabase();

    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 404 }
      );
    }

    // Protection: Super Admin possesses immutable root permissions and cannot be modified
    if (role.key === "super_admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Super Administrator role possesses immutable system-wide access and cannot be modified.",
        },
        { status: 403 }
      );
    }

    // Update other roles (admin, seo, custom)
    role.name = name;
    role.permissions = permissions;
    await role.save();

    return NextResponse.json({
      success: true,
      data: role,
      message: `Role "${role.name}" permissions updated successfully`,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating role" },
      { status: 500 }
    );
  }
}
