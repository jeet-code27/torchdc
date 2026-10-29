import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/permissions";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// POST /api/admin/blogs/upload-image - multipart "file" → Cloudinary (cover images and images inside posts)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const hasAccess =
    user.role === "super_admin" ||
    user.permissions.includes("*") ||
    user.permissions.includes("blogs.create") ||
    user.permissions.includes("blogs.edit");
  if (!hasAccess) {
    return NextResponse.json({ success: false, error: "Forbidden: Missing blog editing permissions" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }
    if (!TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Please upload a JPG, PNG, WEBP, GIF or AVIF image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Image is larger than 8 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(`data:${file.type};base64,${buffer.toString("base64")}`, "torch/blog");
    return NextResponse.json({ success: true, data: uploaded });
  } catch (error) {
    console.error("Blog image upload error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}
