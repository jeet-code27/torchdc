import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { AboutStorefrontView } from "@/components/storefront/about-storefront-view";

export const metadata: Metadata = {
  title: "About Us | Torch Dispensary Washington DC",
  description:
    "DC's cannabis, done right. Hand-picked products, real expertise and fast, discreet delivery from Downtown DC. Initiative 71 compliant.",
};

export const revalidate = 60;

export default async function AboutPage() {
  let counts = { midshelf: 7, topshelf: 20, exotic: 8 };

  try {
    await connectToDatabase();

    const [midshelfCount, topshelfCount, exoticCount] = await Promise.all([
      Product.countDocuments({
        isActive: true,
        $or: [
          { tier: { $regex: "midshelf", $options: "i" } },
          { name: { $regex: "midshelf", $options: "i" } },
        ],
      }),
      Product.countDocuments({
        isActive: true,
        $or: [
          { tier: { $regex: "topshelf", $options: "i" } },
          { name: { $regex: "topshelf", $options: "i" } },
        ],
      }),
      Product.countDocuments({
        isActive: true,
        $or: [
          { tier: { $regex: "exotic|private-reserve", $options: "i" } },
          { name: { $regex: "exotic|private reserve", $options: "i" } },
        ],
      }),
    ]);

    counts = {
      midshelf: midshelfCount > 0 ? midshelfCount : 7,
      topshelf: topshelfCount > 0 ? topshelfCount : 20,
      exotic: exoticCount > 0 ? exoticCount : 8,
    };
  } catch (e) {
    // Fallback to client screenshot values
  }

  return <AboutStorefrontView counts={counts} />;
}
