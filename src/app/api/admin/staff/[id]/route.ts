import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { updateStaffSchema } from "@/lib/validations/staff";

// PUT /api/admin/staff/[id] - update staff details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requirePermission("staff.manage");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { name, email, roleId, isActive } = parsed.data;

    await connectToDatabase();

    // Verify user exists
    const userToUpdate = await User.findOne({ _id: id, isDeleted: false });
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Check email uniqueness if email changed
    if (email.toLowerCase().trim() !== userToUpdate.email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
        isDeleted: false,
      });
      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: "Email is already taken by another user" },
          { status: 400 }
        );
      }
    }

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json(
        { success: false, error: "Selected role does not exist" },
        { status: 400 }
      );
    }

    userToUpdate.name = name;
    userToUpdate.email = email.toLowerCase().trim();
    userToUpdate.role = role._id;
    userToUpdate.isActive = isActive;
    await userToUpdate.save();

    const updatedUser = await User.findById(id)
      .select("-passwordHash")
      .populate("role", "name key isSystem")
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Staff member updated successfully",
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating staff" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/staff/[id] - soft-delete staff member
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requirePermission("staff.manage");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { id } = await params;

    // Guard: Prevent self-deletion
    if (authCheck.user.userId === id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userToDelete = await User.findOne({ _id: id, isDeleted: false }).populate("role");
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Soft delete
    userToDelete.isDeleted = true;
    userToDelete.isActive = false;
    await userToDelete.save();

    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error deleting staff" },
      { status: 500 }
    );
  }
}
