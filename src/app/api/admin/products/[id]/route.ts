import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations/product";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// GET /api/admin/products/[id] - Fetch single product
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
    user.permissions.includes("products.view") ||
    user.permissions.includes("products.edit") ||
    user.permissions.includes("products.seo");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing product view permission" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const product = await Product.findById(id)
      .populate("categoryIds", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching product" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product details
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
    user.permissions.includes("products.edit");

  const canEditSeoOnly =
    user.permissions.includes("products.seo") && !canEditFull;

  if (!canEditFull && !canEditSeoOnly) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing product edit permissions" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Role Enforcement: If user only has products.seo permission, only update SEO fields
    if (canEditSeoOnly) {
      if (body.seo) {
        product.seo = {
          metaTitle: body.seo.metaTitle || product.seo.metaTitle,
          metaDescription: body.seo.metaDescription || product.seo.metaDescription,
          focusKeyword: body.seo.focusKeyword || product.seo.focusKeyword,
          canonicalUrl: body.seo.canonicalUrl || product.seo.canonicalUrl,
          metaRobotsIndex:
            body.seo.metaRobotsIndex !== undefined
              ? body.seo.metaRobotsIndex
              : product.seo.metaRobotsIndex,
        };
        await product.save();
      }

      const updated = await Product.findById(id)
        .populate("categoryIds", "name slug")
        .lean();

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Product SEO metadata updated successfully",
      });
    }

    // Full Edit validation
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { success: false, error: `Validation error: ${issues}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check slug collision with other products
    const existing = await Product.findOne({
      slug: data.slug.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Product slug "${data.slug}" is already in use by another product` },
        { status: 400 }
      );
    }

    // Cloudinary Cleanup: Find any old images that are no longer in new images list
    const oldPublicIds = (product.images || [])
      .map((img) => img.publicId)
      .filter(Boolean) as string[];

    const newPublicIds = new Set(
      (data.images || [])
        .map((img) => img.publicId)
        .filter(Boolean) as string[]
    );

    const deletedPublicIds = oldPublicIds.filter((pId) => !newPublicIds.has(pId));
    for (const pId of deletedPublicIds) {
      deleteFromCloudinary(pId).catch((err) =>
        console.error("Cloudinary cleanup error on product update:", err)
      );
    }

    product.name = data.name;
    product.slug = data.slug.toLowerCase().trim();
    product.description = data.description || "";
    product.shortDescription = data.shortDescription || "";
    product.sku = data.sku || "";
    product.type = data.type;
    product.price = data.price;
    product.salePrice = data.salePrice ?? undefined;
    product.stock = data.stock;
    product.inStock = data.inStock;
    product.variants = (data.variants || []) as typeof product.variants;
    product.categoryIds = data.categoryIds as unknown as typeof product.categoryIds;
    product.brand = data.brand || "";
    product.images = (data.images || []) as typeof product.images;
    product.featured = data.featured;
    product.isBestSeller = data.isBestSeller;
    product.isNewArrival = data.isNewArrival;
    product.isActive = data.isActive;
    product.seo = {
      metaTitle: data.seo.metaTitle || `Buy ${data.name} in Washington DC | TORCH Dispensary`,
      metaDescription:
        data.seo.metaDescription ||
        `Shop premium ${data.name} in Washington DC at Torch Dispensary. Fast local cannabis delivery.`,
      focusKeyword: data.seo.focusKeyword || `${data.name} DC`,
      canonicalUrl: data.seo.canonicalUrl || `https://torchdc.com/product/${data.slug}`,
      metaRobotsIndex: data.seo.metaRobotsIndex ?? true,
    };

    await product.save();

    const updated = await Product.findById(id)
      .populate("categoryIds", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Product "${product.name}" updated successfully`,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error updating product" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product and its Cloudinary media
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
    user.permissions.includes("products.delete");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing product delete permission" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete all attached Cloudinary images
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          deleteFromCloudinary(img.publicId).catch((err) =>
            console.error("Cloudinary error deleting product image:", err)
          );
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" and associated images deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error deleting product" },
      { status: 500 }
    );
  }
}
