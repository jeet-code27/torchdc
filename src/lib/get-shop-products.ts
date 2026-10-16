import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { ShopProduct } from "@/components/storefront/shop-product-card";
import { tierFromCategories, weightOptions } from "@/lib/deals";

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
      // Only flowers have a tier ("Exotic 1G Pre-Rolls" is a pre-roll, not Private Reserve)
      const flowerTier = category === "flowers" ? tierFromCategories(catSlugs, p.name) : null;
      const tier: "midshelf" | "topshelf" | "exotic" | undefined =
        flowerTier === "Private Reserve"
          ? "exotic"
          : flowerTier === "Topshelf"
          ? "topshelf"
          : flowerTier === "Midshelf"
          ? "midshelf"
          : undefined;
      // Tiered flowers are sold by weight at the tier chart price
      const tierWeights = flowerTier ? weightOptions(flowerTier) : null;

      // Weight detection
      let weight = tierWeights ? tierWeights[0].label : "";
      if (!weight && p.variants && p.variants.length > 0) {
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
      // Same as the client site card: "Tier · Strain", else the start of the short description
      const shortText = String(p.shortDescription || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        // Client house style: no em or en dashes in shopper-facing copy
        .replace(/\s+[—–]\s*/g, ", ")
        .replace(/[—–]/g, "-")
        .trim()
        .slice(0, 40);
      const subtitle =
        parts.join(" · ") ||
        shortText ||
        (category ? category.charAt(0).toUpperCase() + category.slice(1) : "");

      // Determine badge
      const badge = p.isBestSeller
        ? "BEST SELLER"
        : p.isNewArrival
        ? "NEW"
        : undefined;

      // Price calculation: Use lowest starting price if product has variants
      let price = p.price || 0;
      let salePrice = p.salePrice || undefined;
      // "from $X" when the shopper picks between options (weights or variants)
      const hasOptions = tierWeights ? tierWeights.length > 1 : (p.variants?.length || 0) > 1;

      if (tierWeights) {
        price = Math.min(...tierWeights.map((w) => w.price));
        salePrice = undefined;
      } else if (p.variants && p.variants.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validVariants = p.variants.filter((v: any) => typeof v.price === "number" && v.price > 0);
        if (validVariants.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sorted = [...validVariants].sort((a: any, b: any) => a.price - b.price);
          price = sorted[0].price;
          salePrice = sorted[0].salePrice || undefined;
        }
      }

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
        hasOptions,
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
