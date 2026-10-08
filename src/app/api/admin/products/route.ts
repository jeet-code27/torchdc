import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getCurrentUser } from "@/lib/permissions";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { productSchema } from "@/lib/validations/product";
import { importProductsFromCsv } from "@/lib/product-importer";

// GET /api/admin/products - List products with filters and search
export async function GET(req: NextRequest) {
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
    user.permissions.includes("products.view");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing products view permission" },
      { status: 403 }
    );
  }

  try {
    await connectToDatabase();

    // Auto-seed from WooCommerce CSV if database is empty
    const currentTotal = await Product.countDocuments();
    if (currentTotal === 0) {
      try {
        await importProductsFromCsv();
      } catch (autoSyncErr) {
        console.error("Auto-sync products from CSV on first load error:", autoSyncErr);
      }
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const inStock = searchParams.get("inStock");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { "seo.focusKeyword": { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      filter.categoryIds = category;
    }

    if (type && (type === "simple" || type === "variable")) {
      filter.type = type;
    }

    if (status !== null && status !== undefined && status !== "") {
      filter.isActive = status === "true" || status === "active";
    }

    if (inStock !== null && inStock !== undefined && inStock !== "") {
      filter.inStock = inStock === "true";
    }

    const products = await Product.find(filter)
      .populate("categoryIds", "name slug")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("Error listing products:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error listing products" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
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
    user.permissions.includes("products.create");

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Missing product creation permission" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { success: false, error: `Validation error: ${issues}` },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const data = parsed.data;

    // Check slug collision
    const existing = await Product.findOne({ slug: data.slug.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Product slug "${data.slug}" is already in use` },
        { status: 400 }
      );
    }

    // Default SEO tags if missing
    const seoPayload = {
      metaTitle:
        data.seo?.metaTitle?.trim() ||
        `Buy ${data.name} in Washington DC | TORCH Dispensary`,
      metaDescription:
        data.seo?.metaDescription?.trim() ||
        `Shop ${data.name} in Washington DC at Torch Dispensary. Premium quality flower, discreet same-day weed delivery, and pickup.`,
      focusKeyword: data.seo?.focusKeyword?.trim() || `${data.name} DC`,
      canonicalUrl:
        data.seo?.canonicalUrl?.trim() ||
        `https://torchdc.com/product/${data.slug}`,
      metaRobotsIndex: data.seo?.metaRobotsIndex ?? true,
    };

    const newProduct = await Product.create({
      ...data,
      salePrice: data.salePrice ?? undefined,
      wooId: data.wooId ?? undefined,
      categoryIds: data.categoryIds as any,
      variants: (data.variants || []) as any,
      images: (data.images || []) as any,
      seo: seoPayload,
    });

    const populated = await Product.findById((newProduct as { _id: unknown })._id)
      .populate("categoryIds", "name slug")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: populated,
        message: `Product "${data.name}" created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error creating product" },
      { status: 500 }
    );
  }
}
