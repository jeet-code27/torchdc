import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
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
    user.permissions.includes("categories.create") ||
    user.permissions.includes("categories.edit");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing category editing permissions" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64 Data URI for Cloudinary uploader
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadRes = await uploadToCloudinary(base64, "torch/categories");

    return NextResponse.json({
      success: true,
      data: uploadRes,
      message: "Category image uploaded to Cloudinary",
    });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
