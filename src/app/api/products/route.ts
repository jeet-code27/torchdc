import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const categorySlug = searchParams.get("category");
    const tier = searchParams.get("tier");
    const strain = searchParams.get("strain");
    const isBestSeller = searchParams.get("bestseller");
    const isNewArrival = searchParams.get("newarrival");
    const sort = searchParams.get("sort") || "featured";
    const limit = parseInt(searchParams.get("limit") || "40", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      isActive: true,
    };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
      ];
    }

    if (isBestSeller === "true") {
      filter.isBestSeller = true;
    }

    if (isNewArrival === "true") {
      filter.isNewArrival = true;
    }

    // Resolve category if slug is provided
    if (categorySlug && categorySlug !== "all") {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        filter.categoryIds = categoryDoc._id;
      } else {
        // Fallback: match name or slug regex
        filter.$or = [
          { name: { $regex: categorySlug, $options: "i" } },
          { brand: { $regex: categorySlug, $options: "i" } },
        ];
      }
    }

    // Strain filtering (Sativa, Indica, Hybrid)
    if (strain && strain !== "all") {
      filter.$or = [
        { name: { $regex: strain, $options: "i" } },
        { shortDescription: { $regex: strain, $options: "i" } },
        { description: { $regex: strain, $options: "i" } },
      ];
    }

    // Tier filtering (midshelf, topshelf, exotic)
    if (tier && tier !== "all") {
      const tierRegex = new RegExp(tier, "i");
      filter.$or = [
        { name: tierRegex },
        { brand: tierRegex },
        { shortDescription: tierRegex },
      ];
    }

    // Sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortObj: Record<string, any> = { featured: -1, createdAt: -1 };
    if (sort === "price-asc") {
      sortObj = { price: 1 };
    } else if (sort === "price-desc") {
      sortObj = { price: -1 };
    } else if (sort === "name-asc") {
      sortObj = { name: 1 };
    } else if (sort === "latest") {
      sortObj = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate("categoryIds", "name slug")
      .sort(sortObj)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
