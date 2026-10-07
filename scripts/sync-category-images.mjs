import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

const mappings = [
  {
    pattern: /^flowers?$/i,
    name: "Flowers",
    slug: "flowers",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/12/torch-product-3.png",
  },
  {
    pattern: /^pre-?rolls?$/i,
    name: "Pre-Rolls",
    slug: "pre-rolls",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/11/new-torch-pre-rolls.jpg",
  },
  {
    pattern: /^disposables?$/i,
    name: "Disposables",
    slug: "disposables",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/09/3-scaled-2.jpg",
  },
  {
    pattern: /^concentrates?$/i,
    name: "Concentrates",
    slug: "concentrates",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/09/1-scaled-2-1.jpg",
  },
  {
    pattern: /^edibles?$/i,
    name: "Edibles",
    slug: "edibles",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/09/7-scaled-2-1.jpg",
  },
  {
    pattern: /^mushrooms?$/i,
    name: "Mushrooms",
    slug: "mushrooms",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/09/8-scaled-2-1.jpg",
  },
  {
    pattern: /^cart(ridge|iredge)s?$/i,
    name: "Cartridges",
    slug: "cartridges",
    imageUrl: "https://torchdc.co/wp-content/uploads/2025/09/4-scaled-2-1.jpg",
  },
];

async function main() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB Atlas");

  for (const item of mappings) {
    console.log(`\nProcessing ${item.name}...`);
    console.log(`Source URL: ${item.imageUrl}`);

    // Upload to Cloudinary
    let uploadRes;
    try {
      uploadRes = await cloudinary.uploader.upload(item.imageUrl, {
        folder: "torch/categories",
        transformation: [
          { quality: "auto:best" },
          { fetch_format: "auto" },
        ],
      });
      console.log(`✓ Cloudinary Uploaded: ${uploadRes.secure_url}`);
      console.log(`  Public ID: ${uploadRes.public_id}`);
    } catch (uploadErr) {
      console.error(`✗ Cloudinary upload failed for ${item.name}:`, uploadErr);
      continue;
    }

    // Find or create in MongoDB
    let category = await Category.findOne({ name: { $regex: item.pattern } });
    if (!category) {
      category = await Category.findOne({ slug: item.slug });
    }

    if (!category) {
      // Create if it doesn't exist (e.g. Concentrates)
      category = await Category.create({
        name: item.name,
        slug: item.slug,
        description: `Explore premium ${item.name} at TORCH. Washington DC's premier cannabis dispensary.`,
        parentId: null,
        displayOrder: 20,
        isActive: true,
        image: {
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id,
          altText: `${item.name} | TORCH DC Dispensary`,
        },
        seo: {
          metaTitle: `Buy ${item.name} in Washington DC | TORCH Dispensary`,
          metaDescription: `Shop premium ${item.name} in Washington DC at Torch Dispensary. Fast local weed delivery and dispensary pickup.`,
          focusKeyword: `${item.name} Washington DC`,
          canonicalUrl: `https://torchdc.com/category/${item.slug}`,
          metaRobotsIndex: true,
        },
      });
      console.log(`✓ Created new category "${item.name}" with Cloudinary image.`);
    } else {
      // If category already has an old publicId that differs, delete the old one
      if (category.image?.publicId && category.image.publicId !== uploadRes.public_id) {
        try {
          await cloudinary.uploader.destroy(category.image.publicId);
          console.log(`  Cleaned up old Cloudinary asset: ${category.image.publicId}`);
        } catch (cleanupErr) {
          console.warn("  Could not delete old asset:", cleanupErr);
        }
      }

      category.image = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        altText: `${category.name} | TORCH DC Dispensary`,
      };
      await category.save();
      console.log(`✓ Updated category "${category.name}" in MongoDB.`);
    }
  }

  console.log("\nAll category images processed successfully!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
