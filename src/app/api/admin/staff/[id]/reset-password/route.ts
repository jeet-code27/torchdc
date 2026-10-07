import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/staff";

export async function POST(
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
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid password",
        },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    await connectToDatabase();

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Staff member not found" },
        { status: 404 }
      );
    }

    const newHash = await bcrypt.hash(password, 10);
    user.passwordHash = newHash;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.email}`,
    });
  } catch (error) {
    console.error("Error resetting staff password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error resetting password" },
      { status: 500 }
    );
  }
}
