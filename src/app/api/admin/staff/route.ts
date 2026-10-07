import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { User } from "@/models/User";
import { Role } from "@/models/Role";
import { createStaffSchema } from "@/lib/validations/staff";

// GET /api/admin/staff - list all non-deleted staff members
export async function GET() {
  const authCheck = await requirePermission("staff.view");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    await connectToDatabase();
    // Ensure Role model is loaded for populate
    void Role;

    const staff = await User.find({ isDeleted: false })
      .select("-passwordHash")
      .populate("role", "name key isSystem")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}

// POST /api/admin/staff - create new staff member
export async function POST(req: NextRequest) {
  const authCheck = await requirePermission("staff.manage");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await req.json();
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const { name, email, password, roleId, isActive } = parsed.data;

    await connectToDatabase();

    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: false,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return NextResponse.json(
        { success: false, error: "Selected role does not exist" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role._id,
      isActive,
      isDeleted: false,
    });

    const populatedUser = await User.findById(newUser._id)
      .select("-passwordHash")
      .populate("role", "name key isSystem")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populatedUser,
        message: "Staff member created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating staff:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error creating staff" },
      { status: 500 }
    );
  }
}
