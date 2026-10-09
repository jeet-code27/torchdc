import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { ShopProduct } from "@/components/storefront/shop-product-card";

export async function getShopProducts(): Promise<ShopProduct[]> {
  try {
    await connectToDatabase();

    const categories = await Category.find({}).lean();
    const catMap = new Map<string, string>();
    for (const c of categories) {
      catMap.set(c._id.toString(), c.slug);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await Product.find({ isActive: true })
      .select("name slug price salePrice images categoryIds isBestSeller isNewArrival strainType tier variants shortDescription")
      .sort({ isBestSeller: -1, isNewArrival: -1, createdAt: -1 })
      .lean();

    return products.map((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catSlugs: string[] = (p.categoryIds || []).map((id: any) =>
        catMap.get(id?.toString()) || ""
      );

      // Determine main category
      let category = "";
      const mainCats = [
        "flowers",
        "edibles",
        "disposables",
        "cartridges",
        "pre-rolls",
        "concentrates",
        "mushrooms",
      ];
      for (const mc of mainCats) {
        if (catSlugs.includes(mc)) {
          category = mc;
          break;
        }
      }

      if (!category && catSlugs.length > 0) {
        category =
          catSlugs.find(
            (s) =>
              s &&
              ![
                "hybrid",
                "indica",
                "sativa",
                "topshelf",
                "midshelf",
                "private-reserve",
              ].includes(s)
          ) || catSlugs[0];
      }

      if (!category) {
        const n = p.name.toLowerCase();
        if (n.includes("disposable")) category = "disposables";
        else if (n.includes("cartridge")) category = "cartridges";
        else if (n.includes("preroll") || n.includes("pre-roll")) category = "pre-rolls";
        else if (n.includes("edible") || n.includes("gummy")) category = "edibles";
        else if (
          n.includes("resin") ||
          n.includes("concentrate") ||
          n.includes("wax") ||
          n.includes("badder") ||
          n.includes("sugar") ||
          n.includes("diamonds")
        )
          category = "concentrates";
        else if (n.includes("mushroom")) category = "mushrooms";
        else category = "flowers";
      }

      // Determine strain
      let strain: "sativa" | "indica" | "hybrid" | undefined;
      const lowerName = p.name.toLowerCase();
      if (catSlugs.includes("sativa") || lowerName.includes("sativa")) {
        strain = "sativa";
      } else if (catSlugs.includes("indica") || lowerName.includes("indica")) {
        strain = "indica";
      } else if (catSlugs.includes("hybrid") || lowerName.includes("hybrid")) {
        strain = "hybrid";
      }

      // Determine flower tier
      let tier: "midshelf" | "topshelf" | "exotic" | undefined;
      if (
        catSlugs.includes("private-reserve") ||
        lowerName.includes("private reserve") ||
        lowerName.includes("exotic")
      ) {
        tier = "exotic";
      } else if (
        catSlugs.includes("topshelf") ||
        lowerName.includes("topshelf")
      ) {
        tier = "topshelf";
      } else if (
        catSlugs.includes("midshelf") ||
        lowerName.includes("midshelf")
      ) {
        tier = "midshelf";
      }

      // Weight detection
      let weight = "";
      if (p.variants && p.variants.length > 0) {
        const v = p.variants[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attrs = v.attributes as any;
        weight = attrs?.size || attrs?.Weight || v.name || "";
      }
      if (!weight) {
        const match = p.name.match(/(\d+(?:\.\d+)?\s*(?:g|oz|mg|ct|pk))/i);
        if (match) weight = match[0];
      }
      if (!weight && category === "flowers") {
        weight = "3.5g";
      }

      // Build subtitle
      const parts: string[] = [];
      if (tier) {
        parts.push(
          tier === "exotic"
            ? "Private Reserve"
            : tier.charAt(0).toUpperCase() + tier.slice(1)
        );
      }
      if (strain) {
        parts.push(strain.charAt(0).toUpperCase() + strain.slice(1));
      }
      if (weight) {
        parts.push(weight);
      }
      const subtitle =
        parts.join(" · ") ||
        (category ? category.charAt(0).toUpperCase() + category.slice(1) : "");

      // Determine badge
      const badge = p.isBestSeller
        ? "BEST SELLER"
        : p.isNewArrival
        ? "NEW"
        : undefined;

      // Price fallback
      const price =
        p.price || (p.variants && p.variants[0]?.price) || 0;
      const salePrice =
        p.salePrice || (p.variants && p.variants[0]?.salePrice) || undefined;

      // Primary image
      const primaryImage =
        p.images?.find((img) => img.isPrimary)?.url ||
        p.images?.[0]?.url ||
        "/images/placeholder-product.png";

      return {
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        price,
        salePrice,
        image: primaryImage,
        category,
        tier,
        strain,
        weight,
        subtitle,
        isBestSeller: Boolean(p.isBestSeller),
        isNewArrival: Boolean(p.isNewArrival),
        badge,
        inStock: p.inStock !== false,
      };
    });
  } catch (error) {
    console.error("Error loading shop products from MongoDB:", error);
    return [];
  }
}
