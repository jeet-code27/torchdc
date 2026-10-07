import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser, requirePermission } from "@/lib/permissions";
import { Category } from "@/models/Category";
import { categorySchema } from "@/lib/validations/category";

// GET /api/admin/categories - list all categories
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
    user.permissions.includes("categories.view") ||
    user.permissions.includes("categories.seo") ||
    user.permissions.includes("products.view");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing permissions to view categories" },
      { status: 403 }
    );
  }

  try {
    await connectToDatabase();
    const categories = await Category.find()
      .populate("parentId", "name slug")
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - create a new category
export async function POST(req: NextRequest) {
  const authCheck = await requirePermission("categories.create");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await req.json();
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

    await connectToDatabase();

    const data = parsed.data;

    // Check if slug is already used
    const existingSlug = await Category.findOne({ slug: data.slug.toLowerCase().trim() });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: `Category slug "${data.slug}" is already in use` },
        { status: 400 }
      );
    }

    // Default SEO tags if left empty
    const seoPayload = {
      metaTitle:
        data.seo?.metaTitle?.trim() ||
        `Buy ${data.name} in Washington DC | TORCH Dispensary`,
      metaDescription:
        data.seo?.metaDescription?.trim() ||
        `Shop premium ${data.name} in Washington DC at Torch Dispensary. Fast local weed delivery and store pickup available.`,
      focusKeyword: data.seo?.focusKeyword?.trim() || `${data.name} Washington DC`,
      canonicalUrl: data.seo?.canonicalUrl?.trim() || `https://torchdc.com/category/${data.slug}`,
      metaRobotsIndex: data.seo?.metaRobotsIndex ?? true,
    };

    const newCategory = await Category.create({
      ...data,
      parentId: data.parentId || null,
      seo: seoPayload,
    });

    const populated = await Category.findById(newCategory._id)
      .populate("parentId", "name slug")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populated,
        message: `Category "${data.name}" created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error creating category" },
      { status: 500 }
    );
  }
}
