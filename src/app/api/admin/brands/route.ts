import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brand, Product } from "@/models";
import { requirePermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const perm = await requirePermission("brands.view");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const brands = await Brand.find(query).sort({ displayOrder: 1, name: 1 }).lean();

    // Attach product count to each brand
    const brandsWithCounts = await Promise.all(
      brands.map(async (b) => {
        const productCount = await Product.countDocuments({ brand: b.name });
        return {
          ...b,
          _id: b._id.toString(),
          productCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      brands: brandsWithCounts,
      stats: {
        totalBrands: brands.length,
        activeBrands: brands.filter((b) => b.isActive).length,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/brands error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const perm = await requirePermission("brands.create");
    if (!perm.authorized) return perm.response;

    await connectDB();
    const body = await req.json();
    const { name, slug, logoUrl, description, website, isActive, featured, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Brand name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const existing = await Brand.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A brand with this slug already exists" },
        { status: 409 }
      );
    }

    const brand = await Brand.create({
      name: name.trim(),
      slug: cleanSlug,
      logoUrl: logoUrl || "",
      description: description || "",
      website: website || "",
      isActive: isActive !== false,
      featured: Boolean(featured),
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/brands error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
