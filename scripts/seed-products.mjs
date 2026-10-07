import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCSVLine(line) {
  const result = [];
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

const ProductVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    sku: { type: String, default: "" },
    attributes: { type: Map, of: String, default: {} },
    wooId: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: true }
);

const ProductImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    altText: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    sku: { type: String, default: "" },
    type: { type: String, enum: ["simple", "variable"], default: "simple" },
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: null },
    stock: { type: Number, default: 100 },
    inStock: { type: Boolean, default: true },
    variants: [ProductVariantSchema],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    brand: { type: String, default: "" },
    images: [ProductImageSchema],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    wooId: { type: mongoose.Schema.Types.Mixed, default: null },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      focusKeyword: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      metaRobotsIndex: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Category = mongoose.models.Category || mongoose.model("Category", new mongoose.Schema({ name: String, slug: String }));

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  const allCategories = await Category.find({}).lean();
  const categoryMap = new Map();
  for (const cat of allCategories) {
    categoryMap.set(cat.name.toLowerCase().trim(), cat._id);
    categoryMap.set(cat.slug.toLowerCase().trim(), cat._id);
  }
  console.log(`Loaded ${allCategories.length} categories from MongoDB.`);

  const csvPath = path.join(process.cwd(), "wc-product-export-6-10-2026-1791275241197.csv");
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);

  const idIdx = 0;
  const typeIdx = 1;
  const nameIdx = 4;
  const shortDescIdx = 8;
  const descIdx = 9;
  const inStockIdx = 14;
  const stockIdx = 15;
  const salePriceIdx = 25;
  const regPriceIdx = 26;
  const catsIdx = 27;
  const imagesIdx = 30;
  const parentIdx = 33;
  const brandIdx = 40;
  const attr1ValIdx = 42;
  const yoastKwIdx = headers.indexOf("Meta: _yoast_wpseo_focuskw");
  const yoastTitleIdx = headers.indexOf("Meta: _yoast_wpseo_title");
  const yoastDescIdx = headers.indexOf("Meta: _yoast_wpseo_metadesc");

  const parentProducts = new Map();
  const variationsList = [];

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
        attrVal: row[attr1ValIdx]?.trim(),
      });
      continue;
    }

    const slug = slugify(name);
    const catNamesRaw = row[catsIdx]?.split(",").map((s) => s.trim()).filter(Boolean) || [];
    const matchedCatIds = [];

    for (const catName of catNamesRaw) {
      const cleanName = catName.includes(">")
        ? catName.split(">").pop().trim().toLowerCase()
        : catName.toLowerCase();
      const match = categoryMap.get(cleanName) || categoryMap.get(slugify(cleanName));
      if (match && !matchedCatIds.some((id) => id.toString() === match.toString())) {
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

  console.log(`Parsed ${parentProducts.size} parent products and ${variationsList.length} variations.`);

  let attachedVariations = 0;
  for (const v of variationsList) {
    const parent = parentProducts.get(v.parentRef);
    if (parent) {
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

      if (!parent.price || parent.price === 0) {
        parent.price = v.regularPrice;
        parent.salePrice = v.salePrice;
      }
      attachedVariations++;
    }
  }

  console.log(`Attached ${attachedVariations} variations to parent products.`);

  let created = 0;
  let updated = 0;

  for (const p of parentProducts.values()) {
    const existing = await Product.findOne({
      $or: [{ slug: p.slug }, { wooId: p.wooId }],
    });

    if (existing) {
      if (existing.images && existing.images.some((img) => img.publicId)) {
        p.images = existing.images;
      }
      Object.assign(existing, p);
      await existing.save();
      updated++;
    } else {
      await Product.create(p);
      created++;
    }
  }

  const total = await Product.countDocuments();
  console.log(`Sync complete! Created: ${created}, Updated: ${updated}. Total in MongoDB: ${total}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed products error:", err);
  process.exit(1);
});
