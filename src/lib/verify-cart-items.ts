import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { tierFromCategories, tierWeightPrice } from "@/lib/deals";

/** Thrown when a cart line cannot be ordered; the message is safe to show the shopper. */
export class CartItemError extends Error {}

export interface VerifiedOrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  weight: string;
  tier: string;
  category: string;
}

const MAIN_CATEGORIES = [
  "flowers",
  "edibles",
  "disposables",
  "cartridges",
  "pre-rolls",
  "concentrates",
  "mushrooms",
];

const sameLabel = (a: unknown, b: unknown) =>
  String(a ?? "").replace(/\s+/g, "").toLowerCase() === String(b ?? "").replace(/\s+/g, "").toLowerCase();

/**
 * Re-prices cart lines from the database. Prices and tiers sent by the browser are never trusted:
 * tiered flowers are charged from the tier weight chart, everything else from its variant or product price.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyCartItems(items: any[]): Promise<VerifiedOrderItem[]> {
  const categories = await Category.find({}).select("slug").lean();
  const catSlugById = new Map<string, string>();
  for (const c of categories) catSlugById.set(c._id.toString(), c.slug);

  return Promise.all(
    items.map(async (it) => {
      const ref = String(it?.id || it?.productId || "");
      const slug = String(it?.slug || "");
      const product = mongoose.Types.ObjectId.isValid(ref)
        ? await Product.findById(ref).lean()
        : await Product.findOne({ slug: slug || ref }).lean();

      if (!product || product.isActive === false || product.inStock === false) {
        throw new CartItemError(
          `${String(it?.name || "An item")} in your cart is no longer available. Please remove it and try again.`
        );
      }

      const catSlugs = (product.categoryIds || []).map((id) => catSlugById.get(id.toString()) || "");
      // Same rule as the product page: no main category means flower
      const category = MAIN_CATEGORIES.find((mc) => catSlugs.includes(mc)) || "flowers";
      const tier = category === "flowers" ? tierFromCategories(catSlugs, product.name) : null;
      const quantity = Math.min(99, Math.max(1, Math.floor(Number(it?.quantity) || 1)));
      const requestedWeight = String(it?.weight || "");

      let price: number;
      let weight = requestedWeight;

      if (tier) {
        const chartPrice = tierWeightPrice(tier, requestedWeight);
        if (chartPrice === null) {
          throw new CartItemError(`Please choose a weight for ${product.name}.`);
        }
        price = chartPrice;
      } else if (product.variants && product.variants.length > 0) {
        const variants = product.variants.filter((v) => typeof v.price === "number" && v.price >= 0);
        const match =
          variants.find((v) => sameLabel(v.name, requestedWeight)) ||
          variants.find((v) =>
            Object.values((v.attributes as Record<string, string>) || {}).some((a) => sameLabel(a, requestedWeight))
          );
        // No exact match (e.g. quick add from a card): charge the cheapest option, as the card shows
        const chosen = match || [...variants].sort((a, b) => a.price - b.price)[0];
        if (!chosen) {
          throw new CartItemError(`${product.name} is not available right now.`);
        }
        price = chosen.price;
        if (!match) weight = chosen.name;
      } else {
        price = Number(product.price) || 0;
      }

      return {
        productId: product._id.toString(),
        name: product.name,
        slug: product.slug,
        price,
        quantity,
        image: String(it?.image || product.images?.[0]?.url || ""),
        weight,
        tier: tier || "",
        category,
      };
    })
  );
}
