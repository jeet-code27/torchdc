import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST() {
  const authCheck = await requirePermission("products.create");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const csvPath = path.join(
      process.cwd(),
      "wc-product-export-6-10-2026-1791275241197.csv"
    );

    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { success: false, error: "WooCommerce products export CSV file not found on server" },
        { status: 404 }
      );
    }

    await connectToDatabase();

    // Load all categories for slug/name matching
    const allCategories = await Category.find({}).lean();
    const categoryMap = new Map<string, string>(); // name/slug -> _id string
    for (const cat of allCategories) {
      categoryMap.set(cat.name.toLowerCase().trim(), cat._id.toString());
      categoryMap.set(cat.slug.toLowerCase().trim(), cat._id.toString());
    }

    const content = fs.readFileSync(csvPath, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const headers = parseCSVLine(lines[0]);

    // Map column indices
    const idIdx = headers.indexOf("ID") !== -1 ? headers.indexOf("ID") : 0;
    const typeIdx = headers.indexOf("Type");
    const nameIdx = headers.indexOf("Name");
    const shortDescIdx = headers.indexOf("Short description");
    const descIdx = headers.indexOf("Description");
    const salePriceIdx = headers.indexOf("Sale price");
    const regPriceIdx = headers.indexOf("Regular price");
    const catsIdx = headers.indexOf("Categories");
    const imagesIdx = headers.indexOf("Images");
    const parentIdx = headers.indexOf("Parent");
    const brandIdx = headers.indexOf("Brands");
    const inStockIdx = headers.indexOf("In stock?");
    const stockIdx = headers.indexOf("Stock");
    const attr1NameIdx = headers.indexOf("Attribute 1 name");
    const attr1ValIdx = headers.indexOf("Attribute 1 value(s)");
    const yoastKwIdx = headers.indexOf("Meta: _yoast_wpseo_focuskw");
    const yoastTitleIdx = headers.indexOf("Meta: _yoast_wpseo_title");
    const yoastDescIdx = headers.indexOf("Meta: _yoast_wpseo_metadesc");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentProducts = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variationsList: any[] = [];

    // Pass 1: Parse rows
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      const rawId = row[idIdx]?.trim();
      const type = row[typeIdx]?.trim().toLowerCase();
      const name = row[nameIdx]?.trim();

      if (!name && type !== "variation") continue;

      if (type === "variation") {
        variationsList.push({
          id: rawId,
          parentRef: row[parentIdx]?.replace(/^id:/i, "").trim(),
          name,
          regularPrice: parseFloat(row[regPriceIdx]) || 0,
          salePrice: row[salePriceIdx] ? parseFloat(row[salePriceIdx]) : null,
          inStock: row[inStockIdx] === "1",
          stock: parseInt(row[stockIdx], 10) || 50,
          attrName: row[attr1NameIdx]?.trim(),
          attrVal: row[attr1ValIdx]?.trim(),
        });
        continue;
      }

      // Variable or Simple product
      const slug = slugify(name);
      const catNamesRaw = row[catsIdx]?.split(",").map((s) => s.trim()).filter(Boolean) || [];
      const matchedCatIds: string[] = [];

      for (const catName of catNamesRaw) {
        // e.g. "Flowers > Hybrid" -> check "Hybrid", "Flowers"
        const cleanName = catName.includes(">")
          ? catName.split(">").pop()!.trim().toLowerCase()
          : catName.toLowerCase();

        const match = categoryMap.get(cleanName) || categoryMap.get(slugify(cleanName));
        if (match && !matchedCatIds.includes(match)) {
          matchedCatIds.push(match);
        }
      }

      const rawImages = row[imagesIdx]?.split(",").map((s) => s.trim()).filter(Boolean) || [];
      const imagesPayload = rawImages.map((url, idx) => ({
        url,
        publicId: "",
        altText: `${name} | TORCH DC`,
        isPrimary: idx === 0,
      }));

      const yoastKw = row[yoastKwIdx]?.trim() || "";
      const yoastTitle = row[yoastTitleIdx]?.trim() || "";
      const yoastDesc = row[yoastDescIdx]?.trim() || "";

      const seoPayload = {
        metaTitle: yoastTitle || `Buy ${name} in Washington DC | TORCH Dispensary`,
        metaDescription:
          yoastDesc ||
          `Shop ${name} in Washington DC at Torch Dispensary. Fast local cannabis delivery.`,
        focusKeyword: yoastKw || `${name} DC`,
        canonicalUrl: `https://torchdc.com/product/${slug}`,
        metaRobotsIndex: true,
      };

      const regularPrice = parseFloat(row[regPriceIdx]) || 0;
      const salePrice = row[salePriceIdx] ? parseFloat(row[salePriceIdx]) : null;

      parentProducts.set(rawId, {
        wooId: rawId,
        name,
        slug,
        type: type === "variable" ? "variable" : "simple",
        description: row[descIdx]?.trim() || "",
        shortDescription: row[shortDescIdx]?.trim() || "",
        price: regularPrice,
        salePrice,
        stock: parseInt(row[stockIdx], 10) || 100,
        inStock: row[inStockIdx] === "1",
        brand: row[brandIdx]?.trim() || "",
        categoryIds: matchedCatIds,
        images: imagesPayload,
        variants: [],
        featured: false,
        isActive: true,
        seo: seoPayload,
      });
    }

    // Pass 2: Attach variations to parent products
    let attachedVariationsCount = 0;
    for (const v of variationsList) {
      const parent = parentProducts.get(v.parentRef);
      if (parent) {
        // Variant display label (e.g. "1 oz" or "14g")
        const variantName = v.attrVal || v.name.replace(/^.*-\s*/, "") || "Standard";

        parent.variants.push({
          name: variantName,
          price: v.regularPrice,
          salePrice: v.salePrice,
          stock: v.stock,
          inStock: v.inStock,
          sku: "",
          attributes: v.attrVal ? { size: v.attrVal } : {},
          wooId: v.id,
        });

        // If parent has no base price yet, set from variant
        if (!parent.price || parent.price === 0) {
          parent.price = v.regularPrice;
          parent.salePrice = v.salePrice;
        }

        attachedVariationsCount++;
      }
    }

    // Pass 3: Upsert into MongoDB
    let createdCount = 0;
    let updatedCount = 0;

    for (const productData of parentProducts.values()) {
      const existing = await Product.findOne({
        $or: [{ slug: productData.slug }, { wooId: productData.wooId }],
      });

      if (existing) {
        // Preserve any Cloudinary images already uploaded
        if (existing.images && existing.images.some((i) => i.publicId)) {
          productData.images = existing.images;
        }
        Object.assign(existing, productData);
        await existing.save();
        updatedCount++;
      } else {
        await Product.create(productData);
        createdCount++;
      }
    }

    const totalProducts = await Product.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        createdCount,
        updatedCount,
        attachedVariationsCount,
        totalProducts,
      },
      message: `Successfully processed ${createdCount + updatedCount} products (${attachedVariationsCount} variations synced)!`,
    });
  } catch (error) {
    console.error("Error importing products from CSV:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error importing products" },
      { status: 500 }
    );
  }
}
