"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  Check,
  Truck,
  Store,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/cart-context";
import { nextStep, nextStepOz, unitOf, normalizeTier } from "@/lib/deals";
import { ShopSidebar } from "./shop-sidebar";
import { ShopCartSidebar } from "./shop-cart-sidebar";

export interface ProductDetailVariant {
  _id?: string;
  name: string;
  price: number;
  salePrice?: number | null;
  stock?: number;
  inStock?: boolean;
  attributes?: Record<string, string>;
}

export interface ProductDetailData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  images: Array<{ url: string; altText?: string; isPrimary?: boolean }>;
  variants?: ProductDetailVariant[];
  category?: { name: string; slug: string };
  tier?: string;
  strain?: "sativa" | "indica" | "hybrid" | string;
  brand?: string;
  inStock?: boolean;
  relatedProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    strain?: string;
    tier?: string;
  }>;
}

interface ProductDetailViewProps {
  product: ProductDetailData;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem, items, finalTotal } = useCart();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Clean title (remove redundant (Sativa), (Hybrid), etc.)
  const cleanTitle = React.useMemo(() => {
    return product.name
      .replace(/\s*\((sativa|indica|hybrid|sativa hybrid|indica hybrid)\)/i, "")
      .trim();
  }, [product.name]);

  // Category & Type detection
  const catSlug = (product.category?.slug || "").toLowerCase();
  const lowerName = product.name.toLowerCase();

  const isPreRoll =
    catSlug.includes("pre-roll") ||
    lowerName.includes("preroll") ||
    lowerName.includes("pre-roll") ||
    lowerName.includes("jeeter");

  const isEdible =
    catSlug.includes("edible") ||
    lowerName.includes("gumm") ||
    lowerName.includes("edible") ||
    lowerName.includes("choc");

  const isVape =
    catSlug.includes("disposable") ||
    catSlug.includes("cartridge") ||
    catSlug.includes("boutiq") ||
    catSlug.includes("lit-stick") ||
    lowerName.includes("disposable") ||
    lowerName.includes("cartridge") ||
    lowerName.includes("vape");

  const isConcentrate =
    catSlug.includes("concentrate") ||
    lowerName.includes("resin") ||
    lowerName.includes("wax") ||
    lowerName.includes("badder") ||
    lowerName.includes("sugar") ||
    lowerName.includes("diamonds");

  const isMushroom =
    catSlug.includes("mushroom") ||
    lowerName.includes("mushroom") ||
    lowerName.includes("shroom");

  const isFlower = React.useMemo(() => {
    if (isPreRoll || isEdible || isVape || isConcentrate || isMushroom) return false;
    if (catSlug === "flowers") return true;
    if (
      product.tier &&
      ["midshelf", "topshelf", "exotic", "private-reserve"].includes(
        product.tier.toLowerCase()
      )
    ) {
      return true;
    }
    if (
      lowerName.includes("topshelf") ||
      lowerName.includes("midshelf") ||
      lowerName.includes("private reserve")
    ) {
      return true;
    }
    return catSlug === "flowers";
  }, [isPreRoll, isEdible, isVape, isConcentrate, isMushroom, catSlug, product.tier, lowerName]);

  // Determine strain tag if explicitly mentioned
  const strainTag = React.useMemo(() => {
    const lower = (product.strain || product.name || "").toLowerCase();
    if (lower.includes("sativa")) return "SATIVA";
    if (lower.includes("indica")) return "INDICA";
    if (lower.includes("hybrid")) return "HYBRID";
    return null;
  }, [product.strain, product.name]);

  // Determine flower tier tag
  const tierTag = React.useMemo(() => {
    const lower = (product.tier || product.category?.slug || product.name || "").toLowerCase();
    if (lower.includes("private-reserve") || lower.includes("exotic")) return "EXOTIC";
    if (lower.includes("topshelf")) return "TOPSHELF";
    if (lower.includes("midshelf")) return "MIDSHELF";
    return "TOPSHELF";
  }, [product.tier, product.category, product.name]);

  // Variants calculation: Use DB variants if provided (sorted ascending by price), or standard flower weights
  const variants = React.useMemo(() => {
    if (product.variants && product.variants.length > 1) {
      return [...product.variants].sort((a, b) => a.price - b.price);
    }
    if (isFlower) {
      // If product.price is an ounce price (>= 90), scale starting 3.5g eighth realistically ($35-$59)
      const isOuncePrice = (product.price || 0) >= 90;
      const baseEighth = isOuncePrice
        ? (tierTag === "MIDSHELF" ? 35 : tierTag === "EXOTIC" ? 60 : 49)
        : product.price || 49;

      const ozPrice = isOuncePrice ? product.price : baseEighth * 3.5;
      const halfOz = Math.round(ozPrice * 0.7);
      const quarterOz = Math.round(baseEighth * 1.6);

      return [
        { name: "3.5g", price: baseEighth, inStock: true },
        { name: "7g", price: quarterOz, inStock: true },
        { name: "14g", price: halfOz, inStock: true },
        { name: "1 oz", price: ozPrice, inStock: true },
      ];
    }
    if (product.variants && product.variants.length === 1) {
      return product.variants;
    }
    return [];
  }, [product.variants, isFlower, product.price, tierTag]);

  // A product has variants ONLY if it has more than 1 option
  const hasVariants = variants.length > 1;

  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);

  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const currentPrice = hasVariants ? activeVariant.price : product.price;
  const currentSalePrice = hasVariants ? activeVariant.salePrice : product.salePrice;

  // Extract weight or potency from product name (e.g. "200mg", "1000mg", "2g", "1g", "3.5g", "1 oz", "4g")
  const extractedWeightOrPotency = React.useMemo(() => {
    const match = product.name.match(/(\d+(?:\.\d+)?\s*(?:mg|g|oz|ct|pk))/i);
    return match ? match[0].toUpperCase() : null;
  }, [product.name]);

  // Determine label for variants (e.g. "Choose weight" only when variants represent weights)
  const variantLabel = React.useMemo(() => {
    const hasWeightNames = variants.some((v) =>
      /\b(\d+(?:\.\d+)?\s*(?:g|oz|gram))\b/i.test(v.name)
    );
    if (isFlower || hasWeightNames) {
      return "Choose weight";
    }
    const hasPackNames = variants.some((v) =>
      /\b(pack|piece|count|ct|pk)\b/i.test(v.name)
    );
    if (hasPackNames) {
      return "Choose pack size";
    }
    return "Choose option";
  }, [variants, isFlower]);

  // Determine top terpene based on strain for flowers
  const topTerpene = React.useMemo(() => {
    if (strainTag === "SATIVA") return "Limonene";
    if (strainTag === "INDICA") return "Myrcene";
    return "Caryophyllene";
  }, [strainTag]);

  // Determine best for timing
  const bestFor = React.useMemo(() => {
    if (strainTag === "SATIVA") return "Daytime";
    if (strainTag === "INDICA") return "Evening / Night";
    return "Anytime";
  }, [strainTag]);

  // Display Title with strain in parentheses if flower (matches screenshot "Strawberry Cough (Sativa)")
  const displayTitle = React.useMemo(() => {
    if (product.name.includes("(") && product.name.includes(")")) {
      return product.name;
    }
    if (strainTag && isFlower) {
      return `${cleanTitle} (${strainTag.charAt(0) + strainTag.slice(1).toLowerCase()})`;
    }
    return product.name;
  }, [product.name, cleanTitle, strainTag, isFlower]);

  // Dynamic Specs & Headings strictly tailored to product category
  const { spec1, spec2, spec3, rightBadge, leftBadge, aboutHeading, similarHeading } =
    React.useMemo(() => {
      // 1. Flowers (Flower Tier, Strain, Terpene, Timing)
      if (isFlower) {
        return {
          leftBadge: tierTag,
          rightBadge: strainTag || "FLOWER",
          spec1: { label: "TOP TERPENE", value: topTerpene || "Myrcene" },
          spec2: {
            label: "TYPE",
            value:
              strainTag === "SATIVA"
                ? "Sativa"
                : strainTag === "INDICA"
                ? "Indica"
                : "Hybrid",
          },
          spec3: { label: "BEST FOR", value: bestFor || "Anytime" },
          aboutHeading: "About this strain",
          similarHeading: `More ${
            tierTag.charAt(0) + tierTag.slice(1).toLowerCase()
          } strains`,
        };
      }

      // 2. Pre-Rolls (Format, Strain, Best For)
      if (isPreRoll) {
        const isInfused = lowerName.includes("enhanced") || lowerName.includes("infused") || lowerName.includes("diamond");
        return {
          leftBadge: "PRE-ROLLS",
          rightBadge: strainTag || extractedWeightOrPotency || "PRE-ROLL",
          spec1: { label: "FORMAT", value: isInfused ? "Infused Pre-Roll" : "Craft Pre-Roll" },
          spec2: { label: "STRAIN", value: strainTag ? strainTag.charAt(0) + strainTag.slice(1).toLowerCase() : "Curated Blend" },
          spec3: { label: "WEIGHT / PACK", value: extractedWeightOrPotency || "Pack" },
          aboutHeading: "About this pre-roll",
          similarHeading: "More Pre-Rolls",
        };
      }

      // 3. Edibles / Gummies (Category, Potency, Format)
      if (isEdible) {
        return {
          leftBadge: "EDIBLES",
          rightBadge: extractedWeightOrPotency || "200MG",
          spec1: { label: "CATEGORY", value: "Edibles" },
          spec2: {
            label: "POTENCY",
            value: extractedWeightOrPotency || "Lab Tested",
          },
          spec3: {
            label: "FORMAT",
            value: lowerName.includes("gumm")
              ? "Gummies"
              : lowerName.includes("choc")
              ? "Chocolates"
              : "Edible",
          },
          aboutHeading: "About this edible",
          similarHeading: "More Edibles & Gummies",
        };
      }

      // 4. Vapes / Disposables / Cartridges (Format, Capacity, Oil Type)
      if (isVape) {
        const isDisp =
          lowerName.includes("disposable") || catSlug.includes("disposable") || lowerName.includes("switch");
        return {
          leftBadge: isDisp ? "DISPOSABLE" : "CARTRIDGE",
          rightBadge:
            extractedWeightOrPotency ||
            (strainTag || "2G"),
          spec1: {
            label: "DEVICE",
            value: isDisp ? "All-in-One Disposable" : "510 Thread Cartridge",
          },
          spec2: { label: "CAPACITY", value: extractedWeightOrPotency || "2G (2000mg)" },
          spec3: { label: "STRAIN / OIL", value: strainTag ? `${strainTag.charAt(0) + strainTag.slice(1).toLowerCase()}` : "Liquid Diamonds" },
          aboutHeading: "About this vape",
          similarHeading: "More Vapes & Disposables",
        };
      }

      // 5. Concentrates (Texture, Potency, Extraction)
      if (isConcentrate) {
        return {
          leftBadge: "CONCENTRATE",
          rightBadge: extractedWeightOrPotency || "1G",
          spec1: { label: "TEXTURE", value: lowerName.includes("wax") ? "Wax" : lowerName.includes("resin") ? "Live Resin" : lowerName.includes("badder") ? "Badder" : "Extract" },
          spec2: { label: "POTENCY", value: "High Cannabinoids" },
          spec3: { label: "PURITY", value: "Pure Extract" },
          aboutHeading: "About this concentrate",
          similarHeading: "More Concentrates & Dabs",
        };
      }

      // 6. Mushrooms (Dose, Format, Effect)
      if (isMushroom) {
        return {
          leftBadge: "MUSHROOMS",
          rightBadge: extractedWeightOrPotency || "4G",
          spec1: { label: "CATEGORY", value: "Mushrooms" },
          spec2: { label: "STRENGTH", value: extractedWeightOrPotency || "4G (4000mg)" },
          spec3: { label: "FORMAT", value: lowerName.includes("gumm") ? "Gummies" : "Infused Blend" },
          aboutHeading: "About this product",
          similarHeading: "More Mushroom Selections",
        };
      }

      // 7. General / Fallback
      return {
        leftBadge: product.category?.name?.toUpperCase() || "PREMIUM",
        rightBadge:
          extractedWeightOrPotency ||
          (strainTag || "TORCH"),
        spec1: { label: "CATEGORY", value: product.category?.name || "Cannabis" },
        spec2: { label: "QUALITY", value: "Lab Tested" },
        spec3: { label: "EXPERIENCE", value: "Curated by Torch" },
        aboutHeading: "About this product",
        similarHeading: `More ${product.category?.name || "Recommendations"}`,
      };
    }, [
      isFlower,
      isPreRoll,
      isEdible,
      isVape,
      isConcentrate,
      isMushroom,
      tierTag,
      strainTag,
      topTerpene,
      bestFor,
      extractedWeightOrPotency,
      lowerName,
      catSlug,
      product.category,
    ]);

  // Flavor notes tailored to real product name and category
  const flavors = React.useMemo(() => {
    // 1. Check title keywords for real fruit/flavor matches
    if (lowerName.includes("pineapple")) return ["Pineapple", "Tropical", "Sweet"];
    if (lowerName.includes("raspberry")) return ["Raspberry", "Tart", "Sweet Berry"];
    if (lowerName.includes("glowberry")) return ["Wild Berry", "Sweet Candy", "Fruity"];
    if (lowerName.includes("pop rocks")) return ["Fizzy Candy", "Berry", "Sweet"];
    if (lowerName.includes("blue zkz") || lowerName.includes("zkittlez")) return ["Blueberry", "Sweet Candy", "Tropical"];
    if (lowerName.includes("sour diesel") || lowerName.includes("diesel")) return ["Pungent Diesel", "Earthy", "Citrus"];
    if (lowerName.includes("italian ice")) return ["Sweet Cream", "Citrus", "Cool Mint"];
    if (lowerName.includes("lemon") || lowerName.includes("citrus") || lowerName.includes("tangie") || lowerName.includes("haze")) {
      return ["Lemon Citrus", "Zesty", "Pine"];
    }
    if (lowerName.includes("gelato") || lowerName.includes("cake") || lowerName.includes("runtz") || lowerName.includes("berry") || lowerName.includes("cherry")) {
      return ["Sweet Cream", "Vanilla", "Sugary Berry"];
    }
    if (lowerName.includes("kush") || lowerName.includes("og")) {
      return ["Pine", "Earthy Wood", "Spicy Herbal"];
    }
    if (lowerName.includes("mendo breath")) return ["Vanilla Caramel", "Pungent Earth", "Nutty"];
    if (lowerName.includes("animal mints")) return ["Sweet Mint", "Cookie Dough", "Pine"];
    if (lowerName.includes("jealousy")) return ["Sweet Gelato", "Spicy Pepper", "Earthy"];
    if (lowerName.includes("slurricane")) return ["Sweet Grape", "Sugary Berry", "Earthy"];
    if (lowerName.includes("white widow")) return ["Earthy", "Woody", "Pine"];
    if (lowerName.includes("cookies and cream")) return ["Vanilla", "Sweet Cream", "Baked Dough"];
    if (lowerName.includes("skywalker")) return ["Spicy Herbal", "Pine", "Diesel"];
    if (lowerName.includes("watermelon")) return ["Juicy Watermelon", "Sweet Candy", "Crisp"];
    if (lowerName.includes("mango")) return ["Ripe Mango", "Tropical", "Sweet"];
    if (lowerName.includes("peach")) return ["Sweet Peach", "Nectar", "Fruity"];
    if (lowerName.includes("apple")) return ["Crisp Apple", "Sweet", "Fruity"];
    if (lowerName.includes("strawberry")) return ["Fresh Strawberry", "Sweet Berry", "Candy"];
    if (lowerName.includes("grape")) return ["Sweet Grape", "Berry", "Juicy"];
    if (lowerName.includes("chocolate")) return ["Rich Cocoa", "Dark Chocolate", "Sweet"];

    // 2. Category-specific defaults when title has no specific flavor
    if (isEdible) return ["Natural Fruit", "Sweet", "Botanical"];
    if (isVape) return ["Pure Terpenes", "Smooth Vapor", "Clean Finish"];
    if (isMushroom) return ["Fruity Infusion", "Sweet", "Earthy Herbal"];
    if (isConcentrate) return ["Pungent Terpenes", "Diesel", "Rich Pine"];
    if (isPreRoll) return ["Smooth Smoke", "Herbal", "Terpene-Rich"];

    // Flowers defaults based on strain
    if (strainTag === "SATIVA") return ["Bright Citrus", "Pine", "Earthy"];
    if (strainTag === "INDICA") return ["Spicy Herbal", "Sweet Wood", "Earthy"];
    return ["Sweet Berry", "Pine", "Earthy"];
  }, [lowerName, isEdible, isVape, isMushroom, isConcentrate, isPreRoll, strainTag]);

  // Effects tailored to product category and strain
  const effects = React.useMemo(() => {
    // 1. Edibles
    if (isEdible) {
      if (lowerName.includes("thcv") || lowerName.includes("slim")) {
        return ["Energized", "Appetite Control", "Focused", "Uplifted"];
      }
      return ["Body Relaxation", "Long-Lasting", "Happy", "Chill"];
    }

    // 2. Vapes & Disposables
    if (isVape) {
      if (strainTag === "SATIVA") {
        return ["Fast-Acting", "Clear-Headed", "Uplifted", "Discreet"];
      }
      if (strainTag === "INDICA") {
        return ["Fast-Acting", "Body Melt", "Deep Chill", "Discreet"];
      }
      return ["Fast-Acting", "Euphoric", "Balanced", "Smooth"];
    }

    // 3. Pre-Rolls
    if (isPreRoll) {
      if (strainTag === "INDICA") {
        return ["Immediate Onset", "Heavy Body Chill", "Relaxed", "Social"];
      }
      return ["Immediate Onset", "Smooth Burn", "Uplifted", "Social"];
    }

    // 4. Mushrooms
    if (isMushroom) {
      return ["Mind Expanding", "Sensory Enhancement", "Deep Euphoria", "Creative"];
    }

    // 5. Concentrates
    if (isConcentrate) {
      return ["Heavy Hitting", "Instant Euphoria", "Full Spectrum", "Long-Lasting"];
    }

    // 6. Flowers
    if (strainTag === "SATIVA") {
      return ["Uplifted", "Creative", "Focused", "Motivated"];
    }
    if (strainTag === "INDICA") {
      return ["Relaxed", "Calm", "Euphoric", "Sleepy"];
    }
    return ["Balanced", "Happy", "Relaxed", "Creative"];
  }, [isEdible, isVape, isPreRoll, isMushroom, isConcentrate, lowerName, strainTag]);

  // Tagline / short description
  const tagline =
    product.shortDescription ||
    (isEdible
      ? "Delicious lab-tested cannabis gummies offering precise dosing and long-lasting effects."
      : isVape
      ? "High-potency cannabis oil loaded into premium hardware for smooth, discreet sessions across DC."
      : isPreRoll
      ? "Expertly rolled premium DC flower delivering a slow, even burn with immediate onset."
      : isMushroom
      ? "Handcrafted wellness blend providing an elevated, sensory-rich experience."
      : isFlower
      ? strainTag === "SATIVA"
        ? "Energizing daytime sativa with a bright, uplifting terpene profile."
        : strainTag === "INDICA"
        ? "Soothing deeply relaxing indica for evening calm and euphoria."
        : "Balanced hybrid providing smooth body relief with clear-headed focus."
      : "Premium DC dispensary selection lab-tested for purity, potency, and smoothness.");

  // About this product description text
  const cleanDescription = React.useMemo(() => {
    if (product.description && product.description.trim().length > 20) {
      return product.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    if (isEdible) {
      return `Premium lab-tested edibles formulated for clean, consistent absorption. Crafted with authentic fruit flavors and potent cannabinoids for a delightful, uplifting Washington DC cannabis experience.`;
    }
    if (isVape) {
      return `High-grade hardware loaded with pure, unadulterated cannabis oil. Smooth vapor, rapid onset, and rich terpene flavor make it ideal for convenient DC sessions on the go.`;
    }
    if (isPreRoll) {
      return `Ready-to-spark premium pre-roll crafted from fresh, whole DC flower. Packed to perfection for an effortless draw, smooth white ash, and potent effects.`;
    }
    if (isMushroom) {
      return `Specially formulated mushroom blend designed for an inspiring, mind-expanding journey. Made with premium ingredients and lab-verified standards.`;
    }
    return `A premium selection curated by Torch for discerning cannabis enthusiasts. Smooth smoke, rich aromatic bouquet, and lab-tested potency make it a top pick for both seasoned connoisseurs and casual sessions.`;
  }, [product.description, isEdible, isVape, isPreRoll, isMushroom]);

  // Primary image
  const primaryImage =
    product.images?.find((img) => img?.isPrimary && img?.url)?.url ||
    product.images?.[0]?.url ||
    (typeof (product.images?.[0] as any) === "string" ? (product.images[0] as unknown as string) : null) ||
    "/images/placeholder-product.png";

  const handleAddToCart = () => {
    const itemWeight =
      hasVariants && activeVariant.name !== "Standard"
        ? activeVariant.name
        : extractedWeightOrPotency || (isFlower ? "3.5g" : product.category?.name || "Standard");

    addItem(
      {
        id: product._id,
        name: cleanTitle,
        slug: product.slug,
        price: currentPrice,
        image: primaryImage,
        weight: itemWeight,
        tier: isFlower ? tierTag : undefined,
        category: product.category?.slug,
      },
      quantity
    );

    setIsAdded(true);
    setSheetOpen(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const itemWeight =
    hasVariants && activeVariant.name !== "Standard"
      ? activeVariant.name
      : extractedWeightOrPotency || (isFlower ? "3.5g" : product.category?.name || "Standard");
  const currentUnit = unitOf(itemWeight);
  const normalizedTier = normalizeTier(tierTag || "");

  const tierFlowerCount = React.useMemo(() => {
    if (!normalizedTier) return { h: 0, o: 0 };
    let h = 0;
    let o = 0;
    items.forEach((it) => {
      if (normalizeTier(it.tier || "") === normalizedTier) {
        const u = unitOf(it.weight);
        if (u === "h") h += it.quantity;
        if (u === "o") o += it.quantity;
      }
    });
    return { h, o };
  }, [items, normalizedTier]);

  const ns = normalizedTier ? nextStep(normalizedTier, tierFlowerCount.h) : null;
  const no = normalizedTier ? nextStepOz(normalizedTier, tierFlowerCount.o) : null;

  return (
    <>
      <div className="shell">
        {/* 1. DESKTOP LEFT RAIL (Category Navigation) */}
        <ShopSidebar activeCategory={catSlug || "flowers"} />

      {/* 2. MAIN CENTER CONTENT (Product Detail View) */}
      <main className="shell__main">
        <div className="pdp">
          {/* Product Image Card */}
          <div className="pdp__img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryImage}
              alt={product.name}
            />
            <span className="pdp__tags">
              {tierTag && (
                <span className="tagdark">{tierTag.toUpperCase()}</span>
              )}
              {strainTag && (
                <span className="taglight">{strainTag.toUpperCase()}</span>
              )}
            </span>
          </div>

          {/* Product Info */}
          <div className="pdp__info">
            {/* Breadcrumb */}
            <span className="crumbs">
              <Link href="/shop">Shop</Link> /{" "}
              <Link href={isFlower ? "/flowers" : `/shop?category=${catSlug || "flowers"}`}>
                {product.category?.name || "Flowers"}
              </Link>
              {tierTag ? ` / ${tierTag}` : ""}
            </span>

            {/* Title */}
            <h1>{displayTitle}</h1>

            {/* Price */}
            <span className="pdp__price">${currentPrice}</span>

            {/* Choose weight / variants */}
            {hasVariants && (
              <>
                <span className="lbl">{variantLabel}</span>
                <div className="weights">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.name + idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`weight ${isSelected ? "is-on" : ""}`}
                      >
                        <strong>{v.name}</strong>
                        <span>${v.price}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Facts 3-column Box */}
            <div className="facts">
              <div>
                <span>{spec1.label}</span>
                <strong>{spec1.value}</strong>
              </div>
              <div>
                <span>{spec2.label}</span>
                <strong>{spec2.value}</strong>
              </div>
              <div>
                <span>{spec3.label}</span>
                <strong>{spec3.value}</strong>
              </div>
            </div>

            {/* Effects */}
            {effects.length > 0 && (
              <>
                <span className="lbl">Effects</span>
                <div className="chiplets">
                  {effects.map((effect) => (
                    <span key={effect} className="chiplet">
                      {effect}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Flavors */}
            {flavors.length > 0 && (
              <>
                <span className="lbl">Flavor</span>
                <div className="chiplets">
                  {flavors.map((flavor) => (
                    <span key={flavor} className="chiplet">
                      {flavor}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* About this strain / product */}
            {cleanDescription && (
              <>
                <span className="lbl">{aboutHeading}</span>
                <p className="pdp__desc">{cleanDescription}</p>
              </>
            )}

            {/* Perks */}
            <div className="perks">
              <div>
                <strong>Free delivery</strong>
                <span>Across DC</span>
              </div>
              <div>
                <strong>Pay cash</strong>
                <span>At the door</span>
              </div>
            </div>

            {/* Desktop buy bar (inside pdp__info, hidden on mobile by CSS) */}
            <div className="pdp__buy">
              <div className="stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  disabled={quantity <= 1}
                  aria-label="Remove one"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  aria-label="Add one"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="buybtn"
                onClick={handleAddToCart}
              >
                Add to cart · ${currentPrice * quantity}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Slider Section (Authentic Client Design) */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-14 pt-8 border-t border-neutral-200/80">
            {/* Header: Title on Left, Controls & 'See all' on Right */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {similarHeading}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors shadow-2xs cursor-pointer active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  href={isFlower ? "/flowers" : `/shop?category=${catSlug || "flowers"}`}
                  className="text-xs sm:text-sm font-bold text-[#4A6E4B] hover:text-[#2F4F30] ml-1 transition-colors whitespace-nowrap"
                >
                  See all
                </Link>
              </div>
            </div>

            {/* Slider Track with horizontal scroll */}
            <div
              ref={sliderRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-3 snap-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {product.relatedProducts.map((rel) => {
                const relDisplayName =
                  isFlower && rel.strain && !rel.name.includes("(")
                    ? `${rel.name} (${rel.strain.charAt(0).toUpperCase() + rel.strain.slice(1).toLowerCase()})`
                    : rel.name;

                const relMeta = isFlower
                  ? `${tierTag || "Topshelf"} · ${rel.strain ? rel.strain.charAt(0).toUpperCase() + rel.strain.slice(1).toLowerCase() : "Hybrid"}`
                  : rel.strain || "Curated";

                return (
                  <div
                    key={rel.id}
                    className="pcard w-[165px] sm:w-[185px] shrink-0 snap-start flex flex-col group relative"
                  >
                    {/* Card Image Box with Floating (+) Button */}
                    <div className="pcard__img relative w-full h-[155px] sm:h-[175px] rounded-[22px] bg-[#F6F8F6] flex items-center justify-center p-3 overflow-hidden">
                      <Link
                        href={`/product/${rel.slug}`}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rel.image || "/assets/img/flower.webp"}
                          alt={rel.name}
                          className="w-28 h-28 sm:w-32 sm:h-32 object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Quick Add (+) Button at bottom right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(
                            {
                              id: rel.id,
                              name: rel.name.replace(/\s*\((sativa|indica|hybrid)\)/i, "").trim(),
                              slug: rel.slug,
                              price: rel.price,
                              image: rel.image || "/assets/img/flower.webp",
                              weight: isFlower ? "3.5g" : "Standard",
                              tier: isFlower ? tierTag : undefined,
                              category: catSlug,
                            },
                            1
                          );
                          toast.success(`Added ${rel.name} to cart`);
                        }}
                        className="add absolute right-2.5 bottom-2.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-neutral-900 shadow-md hover:bg-[#5A805B] hover:text-white flex items-center justify-center font-bold text-xl transition-all cursor-pointer z-10 active:scale-95"
                        aria-label={`Add ${rel.name} to cart`}
                      >
                        +
                      </button>
                    </div>

                    {/* Card Title */}
                    <Link href={`/product/${rel.slug}`} className="mt-2 block">
                      <h3 className="pcard__name font-bold text-sm sm:text-[15px] text-neutral-900 line-clamp-1 group-hover:text-[#5A805B] transition-colors">
                        {relDisplayName}
                      </h3>
                    </Link>

                    {/* Meta: Tier · Strain */}
                    <span className="pcard__meta text-xs text-neutral-500 font-medium mt-0.5 truncate">
                      {relMeta}
                    </span>

                    {/* Price: from $40 */}
                    <div className="pcard__price text-sm sm:text-[15px] font-extrabold text-neutral-900 mt-1">
                      <span className="text-xs font-normal text-neutral-500 mr-1">from</span>
                      ${rel.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 3. DESKTOP RIGHT RAIL (Sticky Cart Sidebar) */}
      <ShopCartSidebar />
    </div>

      {/* ================= MOBILE FLOATING STICKY ACTION BAR ================= */}
      <div className="buybar">
        <div className="stepper">
          <button
            type="button"
            onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
            disabled={quantity <= 1}
            aria-label="Remove one"
          >
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((prev) => prev + 1)}
            aria-label="Add one"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="buybtn"
        >
          Add to cart · ${currentPrice * quantity}
        </button>
      </div>

      {/* ================= ADDED TO CART SLIDE-UP SHEET ================= */}
      {sheetOpen && (
        <div className="sheet">
          <div className="sheet__bg" onClick={() => setSheetOpen(false)} />
          <div
            className="sheet__card"
            role="dialog"
            aria-modal="true"
            aria-label="Added to cart"
          >
            <div className="sheet__grip" />
            <div className="sheet__ok">
              <span className="okdot">✓</span>
              <span>
                <strong>Added to cart</strong>
                <span className="text-xs text-neutral-500">
                  {cleanTitle} · {itemWeight} {quantity > 1 ? `x ${quantity}` : ""}
                </span>
              </span>
            </div>

            {/* If Flower & Ounce Deal */}
            {isFlower && currentUnit === "o" && normalizedTier && no && (
              <div className="dealbox">
                <span className="dealbox__tag">
                  {tierFlowerCount.o >= 8 ? "HALF-POUND HAUL" : "STACK & SAVE"}
                </span>
                <strong>{no.title}</strong>
                <span className="muted">
                  Mix any {normalizedTier} strains by the ounce.
                </span>
                <div className="meter">
                  <span
                    style={{ width: `${Math.min(tierFlowerCount.o, 4) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {/* If Flower & Half-Ounce Deal */}
            {isFlower && currentUnit === "h" && normalizedTier && ns && (
              <div className="dealbox">
                <span className="dealbox__tag">BUNDLE DEAL</span>
                <strong>{ns.title}</strong>
                <span className="muted">
                  Mix any {normalizedTier} strains by the half ounce.
                </span>
                <div className="meter">
                  <span
                    style={{ width: `${Math.min(tierFlowerCount.h, 4) * 25}%` }}
                  />
                </div>

                {product.relatedProducts &&
                  product.relatedProducts.slice(0, 3).map((pick) => {
                    const inCart = items.some((it) => it.id === pick.id);
                    return (
                      <div key={pick.id} className="pickrow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pick.image || "/assets/img/flower.webp"}
                          alt={pick.name}
                        />
                        <span>
                          <strong>{pick.name}</strong>
                          <span>
                            {pick.strain || "Flower"} · ½ oz · ${pick.price}
                          </span>
                        </span>
                        <button
                          type="button"
                          className={`smallpill ${inCart ? "is-on" : ""}`}
                          onClick={() => {
                            addItem(
                              {
                                id: pick.id,
                                name: pick.name,
                                slug: pick.slug,
                                price: pick.price,
                                image: pick.image,
                                weight: "14g",
                                tier: normalizedTier,
                                category: "flowers",
                              },
                              1
                            );
                          }}
                        >
                          {inCart ? "Added" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Action buttons */}
            <div className="sheet__btns">
              <button
                type="button"
                className="ghostbtn"
                onClick={() => setSheetOpen(false)}
              >
                Keep shopping
              </button>
              <Link className="checkoutbtn" href="/cart">
                View cart · ${finalTotal}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
