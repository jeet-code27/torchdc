const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  const collection = mongoose.connection.collection('products');

  // Let's find products with images
  const allWithImages = await collection.find({
    "images.0": { $exists: true }
  }).limit(20).toArray();

  console.log(`Found ${allWithImages.length} products with images.`);

  // Mark first 5-6 as best sellers
  const bestSellerIds = allWithImages.slice(0, 5).map(p => p._id);
  const newArrivalIds = allWithImages.slice(5, 10).map(p => p._id);

  const res1 = await collection.updateMany(
    { _id: { $in: bestSellerIds } },
    { $set: { isBestSeller: true, featured: true } }
  );
  console.log(`Updated best sellers: ${res1.modifiedCount}`);

  const res2 = await collection.updateMany(
    { _id: { $in: newArrivalIds } },
    { $set: { isNewArrival: true } }
  );
  console.log(`Updated new arrivals: ${res2.modifiedCount}`);

  const bestSellers = await collection.find({ isBestSeller: true }, {
    projection: { name: 1, price: 1, "images.url": 1 }
  }).toArray();
  console.log("Current Best Sellers:", JSON.stringify(bestSellers, null, 2));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
