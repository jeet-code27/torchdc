import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { Category } from "@/models/Category";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
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
  const authCheck = await requirePermission("categories.create");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const csvPath = path.join(process.cwd(), "wc-product-export-6-10-2026-1791275241197.csv");
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { success: false, error: "WooCommerce export CSV file not found on server" },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(csvPath, "utf8");
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const headers = parseCSVLine(lines[0]);
    const catIndex = headers.indexOf("Categories");

    if (catIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Categories column not found in CSV" },
        { status: 400 }
      );
    }

    const parentCategories = new Set<string>();
    const childCategories = new Map<string, string>(); // childName -> parentName

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const catString = cols[catIndex];
      if (catString) {
        const parts = catString.split(",").map((s) => s.trim()).filter(Boolean);
        for (const p of parts) {
          if (p.includes(">")) {
            const [parent, child] = p.split(">").map((s) => s.trim());
            parentCategories.add(parent);
            childCategories.set(child, parent);
          } else {
            parentCategories.add(p);
          }
        }
      }
    }

    await connectToDatabase();

    const createdParents = new Map<string, string>(); // parentName -> parentId

    // 1. Create or update parent categories
    for (const parentName of parentCategories) {
      // Don't create as parent if it is only a child
      if (childCategories.has(parentName)) continue;

      const slug = slugify(parentName);
      const existing = await Category.findOne({ slug });

      if (existing) {
        createdParents.set(parentName, existing._id.toString());
      } else {
        const doc = await Category.create({
          name: parentName,
          slug,
          description: `Explore premium ${parentName} available for fast local delivery and pickup in Washington DC from TORCH.`,
          parentId: null,
          isActive: true,
          displayOrder: 0,
          seo: {
            metaTitle: `Buy ${parentName} in Washington DC | TORCH Dispensary`,
            metaDescription: `Shop premium ${parentName} in Washington DC at Torch Dispensary. Lab-tested quality, same-day local cannabis delivery and dispensary pickup.`,
            focusKeyword: `${parentName} Washington DC`,
            canonicalUrl: `https://torchdc.com/category/${slug}`,
            metaRobotsIndex: true,
          },
        });
        createdParents.set(parentName, doc._id.toString());
      }
    }

    // 2. Create or update subcategories with parent link
    let createdChildrenCount = 0;
    for (const [childName, parentName] of childCategories.entries()) {
      const parentId = createdParents.get(parentName);
      const slug = slugify(childName);

      const existing = await Category.findOne({ slug });
      if (!existing) {
        await Category.create({
          name: childName,
          slug,
          description: `Shop top-rated ${childName} cannabis flower & products under ${parentName} at TORCH Washington DC.`,
          parentId: parentId || null,
          isActive: true,
          displayOrder: 1,
          seo: {
            metaTitle: `${childName} (${parentName}) in Washington DC | TORCH Dispensary`,
            metaDescription: `Discover fresh ${childName} strains under ${parentName} in Washington DC at Torch Dispensary. Fast, discreet delivery across DC.`,
            focusKeyword: `${childName} strain DC`,
            canonicalUrl: `https://torchdc.com/category/${slug}`,
            metaRobotsIndex: true,
          },
        });
        createdChildrenCount++;
      } else if (!existing.parentId && parentId) {
        existing.parentId = parentId as unknown as typeof existing.parentId;
        await existing.save();
      }
    }

    const totalCount = await Category.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Categories synced from WooCommerce: ${createdParents.size} parents, ${childCategories.size} subcategories (Total in DB: ${totalCount})`,
      data: {
        parentsCount: createdParents.size,
        childrenCount: createdChildrenCount,
        totalInDb: totalCount,
      },
    });
  } catch (error) {
    console.error("Error importing categories from CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import categories from CSV" },
      { status: 500 }
    );
  }
}
