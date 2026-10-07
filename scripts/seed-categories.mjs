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
    .trim()
    .replace(/[^\w\s-]/g, "")
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

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      altText: { type: String, default: "" },
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    wooId: { type: String, default: "" },
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

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

async function main() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  const csvPath = path.join(process.cwd(), "wc-product-export-6-10-2026-1791275241197.csv");
  const content = fs.readFileSync(csvPath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);
  const catIndex = headers.indexOf("Categories");

  const rawCategories = new Set();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const catCell = cols[catIndex];
    if (catCell) {
      const parts = catCell.split(",").map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => rawCategories.add(p));
    }
  }

  const parentNames = new Set();
  const subCategoryMap = [];

  for (const raw of Array.from(rawCategories)) {
    if (raw.includes(">")) {
      const [parent, child] = raw.split(">").map((s) => s.trim());
      if (parent && child) {
        parentNames.add(parent);
        subCategoryMap.push({ parent, child });
      }
    } else {
      parentNames.add(raw);
    }
  }

  const categoryDocs = new Map();
  let order = 0;

  for (const parent of Array.from(parentNames)) {
    order += 10;
    const slug = slugify(parent);
    let doc = await Category.findOne({ slug });
    if (!doc) {
      doc = await Category.create({
        name: parent,
        slug,
        description: `Explore premium ${parent} at TORCH. Washington DC's premier licensed cannabis and hemp dispensary.`,
        parentId: null,
        displayOrder: order,
        isActive: true,
        seo: {
          metaTitle: `Buy ${parent} in Washington DC | TORCH Dispensary`,
          metaDescription: `Shop premium top-shelf ${parent} in Washington DC with same-day dispensary delivery and convenient pickup. 100% lab tested and compliant.`,
          focusKeyword: `${parent} Washington DC`,
          canonicalUrl: `https://torchdc.com/category/${slug}`,
          metaRobotsIndex: true,
        },
      });
      console.log(`Created parent category: ${parent} (slug: ${slug})`);
    } else {
      console.log(`Found existing parent category: ${parent}`);
    }
    categoryDocs.set(parent, doc);
  }

  for (const { parent, child } of subCategoryMap) {
    const parentDoc = categoryDocs.get(parent);
    const slug = `${slugify(parent)}-${slugify(child)}`;
    let childDoc = await Category.findOne({ slug });
    if (!childDoc) {
      childDoc = await Category.create({
        name: child,
        slug,
        description: `Browse ${child} in ${parent} at TORCH Dispensary Washington DC.`,
        parentId: parentDoc ? parentDoc._id : null,
        displayOrder: order + 5,
        isActive: true,
        seo: {
          metaTitle: `${child} ${parent} in Washington DC | TORCH Dispensary`,
          metaDescription: `Discover the best ${child} ${parent} in Washington DC. Premium craft selection with swift local delivery from TORCH.`,
          focusKeyword: `${child} ${parent} DC`,
          canonicalUrl: `https://torchdc.com/category/${slug}`,
          metaRobotsIndex: true,
        },
      });
      console.log(`Created subcategory: ${child} under ${parent} (slug: ${slug})`);
    } else {
      console.log(`Found existing subcategory: ${child}`);
    }
  }

  const total = await Category.countDocuments();
  console.log(`Finished! Total categories in database: ${total}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
