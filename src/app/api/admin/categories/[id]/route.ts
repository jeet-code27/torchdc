import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations/category";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET /api/admin/categories/[id] - fetch single category details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    user.permissions.includes("categories.view") ||
    user.permissions.includes("categories.edit") ||
    user.permissions.includes("categories.seo");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing category view permission" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const category = await Category.findById(id)
      .populate("parentId", "name slug")
      .lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching category" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - update category details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const canEditFull =
    user.role === "super_admin" ||
    user.permissions.includes("*") ||
    user.permissions.includes("categories.edit");

  const canEditSeoOnly =
    user.permissions.includes("categories.seo") && !canEditFull;

  if (!canEditFull && !canEditSeoOnly) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing category editing permissions" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Role Enforcement: If user only has categories.seo permission, only update SEO fields
    if (canEditSeoOnly) {
      if (body.seo) {
        category.seo = {
          metaTitle: body.seo.metaTitle || category.seo.metaTitle,
          metaDescription: body.seo.metaDescription || category.seo.metaDescription,
          focusKeyword: body.seo.focusKeyword || category.seo.focusKeyword,
          canonicalUrl: body.seo.canonicalUrl || category.seo.canonicalUrl,
          metaRobotsIndex:
            body.seo.metaRobotsIndex !== undefined
              ? body.seo.metaRobotsIndex
              : category.seo.metaRobotsIndex,
        };
        await category.save();
      }

      return NextResponse.json({
        success: true,
        data: category,
        message: "Category SEO settings updated successfully",
      });
    }

    // Full edit mode (categories.edit / super_admin)
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug uniqueness if changed
    if (data.slug.toLowerCase().trim() !== category.slug) {
      const slugTaken = await Category.findOne({
        slug: data.slug.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (slugTaken) {
        return NextResponse.json(
          { success: false, error: `Slug "${data.slug}" is already used by another category` },
          { status: 400 }
        );
      }
    }

    // Check if image publicId changed, and delete the old image from Cloudinary
    const oldPublicId = category.image?.publicId;
    const newPublicId = data.image?.publicId;

    if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
      // Background delete old image from Cloudinary
      deleteFromCloudinary(oldPublicId).catch((err) =>
        console.error("Cloudinary old image delete error:", err)
      );
    }

    // Prevent category from being its own parent
    if (data.parentId === id) {
      data.parentId = null;
    }

    category.name = data.name;
    category.slug = data.slug.toLowerCase().trim();
    category.description = data.description || "";
    category.parentId = (data.parentId as unknown as typeof category.parentId) || null;
    category.image = {
      url: data.image?.url || "",
      publicId: data.image?.publicId || "",
      altText: data.image?.altText || "",
    };
    category.displayOrder = data.displayOrder ?? 0;
    category.isActive = data.isActive;
    category.seo = {
      metaTitle: data.seo.metaTitle || `Buy ${data.name} in Washington DC | TORCH Dispensary`,
      metaDescription:
        data.seo.metaDescription ||
        `Shop premium ${data.name} in Washington DC at Torch Dispensary. Fast local cannabis delivery.`,
      focusKeyword: data.seo.focusKeyword || `${data.name} Washington DC`,
      canonicalUrl: data.seo.canonicalUrl || `https://torchdc.com/category/${data.slug}`,
      metaRobotsIndex: data.seo.metaRobotsIndex ?? true,
    };

    await category.save();

    const updated = await Category.findById(id)
      .populate("parentId", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Category "${category.name}" updated successfully`,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - delete category and its Cloudinary image
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    user.permissions.includes("categories.delete");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing category delete permission" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary if publicId exists
    if (category.image?.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }

    // Unlink children pointing to this category
    await Category.updateMany({ parentId: id }, { $set: { parentId: null } });

    // Delete category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" and associated assets removed`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error deleting category" },
      { status: 500 }
    );
  }
}
