import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  const collection = mongoose.connection.collection("categories");
  const res = await collection.deleteMany({
    slug: {
      $in: [
        "flowers-hybrid",
        "flowers-indica",
        "flowers-sativa",
        "disposables-2g-boutiq-switch",
        "disposables-lit-sticks",
      ],
    },
  });
  console.log("Removed extra duplicates:", res.deletedCount);
  const all = await collection
    .find({})
    .project({ name: 1, slug: 1, parentId: 1, "seo.metaTitle": 1 })
    .toArray();
  console.log("Clean categories in database (Total " + all.length + "):");
  for (const c of all) {
    console.log(`- ${c.name} (slug: /${c.slug}) -> Parent: ${c.parentId ? c.parentId : "ROOT"}`);
  }
  await mongoose.disconnect();
}

run().catch(console.error);
