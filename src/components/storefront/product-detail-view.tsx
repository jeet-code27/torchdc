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
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/cart-context";

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
  const { addItem } = useCart();
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Only use variants if the product actually has multiple variants
  const variants = React.useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  }, [product.variants]);

  // A product has variants ONLY if it has more than 1 option in the database
  const hasVariants = variants.length > 1;

  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);

  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const currentPrice = hasVariants ? activeVariant.price : product.price;
  const currentSalePrice = hasVariants ? activeVariant.salePrice : product.salePrice;

  // Clean title (remove redundant (Sativa), (Hybrid), etc. for clean heading display)
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
    // If name contains typical flower tier markers
    if (lowerName.includes("topshelf") || lowerName.includes("midshelf") || lowerName.includes("private reserve")) {
      return true;
    }
    // Default to flower only if category is flowers
    return catSlug === "flowers";
  }, [isPreRoll, isEdible, isVape, isConcentrate, isMushroom, catSlug, product.tier, lowerName]);

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

  // Dynamic Specs & Headings strictly tailored to product category
  const { spec1, spec2, spec3, rightBadge, leftBadge, aboutHeading, similarHeading } =
    React.useMemo(() => {
      // 1. Flowers (Flower Tier, Strain, Terpene, Timing)
      if (isFlower) {
        return {
          leftBadge: tierTag,
          rightBadge: strainTag || "FLOWER",
          spec1: { label: "TOP TERPENE", value: topTerpene },
          spec2: {
            label: "TYPE",
            value:
              strainTag === "SATIVA"
                ? "Sativa"
                : strainTag === "INDICA"
                ? "Indica"
                : "Hybrid",
          },
          spec3: { label: "BEST FOR", value: bestFor },
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
    product.images?.[0]?.url || "/images/placeholder-product.png";

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
    toast.success(
      `Added ${quantity}x ${cleanTitle} to cart!`,
      { duration: 2500 }
    );
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#fafbfa] text-neutral-900 pb-28 lg:pb-16">
      {/* Top Navigation Bar: Back to Menu */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-950 transition-colors py-2 px-4 rounded-full bg-white border border-neutral-200/90 shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>

          {/* Desktop Breadcrumb on right side */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Link href="/" className="hover:text-neutral-700">Home</Link>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <Link href="/shop" className="hover:text-neutral-700">Shop</Link>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <Link href={`/shop?category=${product.category?.slug || "flowers"}`} className="hover:text-neutral-700">
              {product.category?.name || "Flowers"}
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-300" />
            <span className="text-neutral-700 font-semibold">{leftBadge}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-10 lg:space-y-14">
        {/* ================= 2-COLUMN LAYOUT ON DESKTOP ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: PRODUCT IMAGE CARD & FULFILLMENT ================= */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
            {/* Main Product Image Card */}
            <div className="relative bg-[#edf4ec] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 flex items-center justify-center border border-[#deebd9] shadow-xs overflow-hidden aspect-square w-full">
              {/* Top-Left Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
                <span className="bg-white/95 backdrop-blur-xs text-[#2F4F30] font-black text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs border border-emerald-100">
                  {leftBadge}
                </span>
              </div>

              {/* Top-Right Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
                <span className="bg-[#fdf1ea] text-[#E8561E] font-black text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xs border border-orange-100">
                  {rightBadge}
                </span>
              </div>

              {/* Center Product Photo */}
              <div className="relative w-full h-full max-w-[340px] max-h-[340px] sm:max-w-[400px] sm:max-h-[400px]">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-300 hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Desktop Fulfillment Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#edf4ed] text-[#557754] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-extrabold text-xs sm:text-sm text-neutral-900">
                    Free delivery
                  </span>
                  <span className="block text-[11px] text-neutral-500 font-medium">
                    Across DC · 35-45 min
                  </span>
                </div>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-extrabold text-xs sm:text-sm text-neutral-900">
                    Curbside pickup
                  </span>
                  <span className="block text-[11px] text-neutral-500 font-medium">
                    1025 F St NW
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: TITLE, PRICE, VARIANTS, SPECS, ACTIONS ================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title, Tagline & Pricing */}
            <div className="space-y-3">
              {/* Mobile Breadcrumb */}
              <nav aria-label="Mobile Breadcrumb" className="sm:hidden flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <Link href="/shop" className="hover:text-neutral-700">Shop</Link>
                <ChevronRight className="w-3 h-3 text-neutral-300" />
                <Link href={`/shop?category=${product.category?.slug || "flowers"}`} className="hover:text-neutral-700">
                  {product.category?.name || "Flowers"}
                </Link>
                <ChevronRight className="w-3 h-3 text-neutral-300" />
                <span className="text-neutral-700 font-semibold">{leftBadge}</span>
              </nav>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-neutral-900 tracking-tight leading-tight">
                {cleanTitle}
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-normal">
                {tagline}
              </p>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                  ${currentPrice}
                </span>
                {currentSalePrice && currentSalePrice < currentPrice && (
                  <span className="text-lg font-bold text-neutral-400 line-through">
                    ${currentSalePrice}
                  </span>
                )}
              </div>
            </div>

            {/* ONLY SHOW CHOOSE WEIGHT / VARIANT SELECTOR IF PRODUCT HAS MULTIPLE VARIANTS */}
            {hasVariants && (
              <div className="space-y-2.5">
                <label className="block text-sm font-extrabold text-neutral-900">
                  {variantLabel}
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.name + idx}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`p-3 sm:p-3.5 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-[#edf4ec] border-2 border-[#557754] text-neutral-900 shadow-2xs"
                            : "bg-white border border-neutral-200/90 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="font-black text-sm sm:text-base">
                          {v.name}
                        </span>
                        <span className="text-xs font-bold text-neutral-500">
                          ${v.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3 Spec Cards (Category Aware) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Card 1 */}
              <div className="bg-[#f8faf8] border border-neutral-200/80 rounded-2xl p-3 sm:p-3.5 text-center sm:text-left">
                <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  {spec1.label}
                </span>
                <span className="block font-black text-xs sm:text-sm text-neutral-900 mt-0.5 truncate">
                  {spec1.value}
                </span>
              </div>

              {/* Card 2 */}
              <div className="bg-[#f8faf8] border border-neutral-200/80 rounded-2xl p-3 sm:p-3.5 text-center sm:text-left">
                <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  {spec2.label}
                </span>
                <span className="block font-black text-xs sm:text-sm text-neutral-900 mt-0.5 truncate">
                  {spec2.value}
                </span>
              </div>

              {/* Card 3 */}
              <div className="bg-[#f8faf8] border border-neutral-200/80 rounded-2xl p-3 sm:p-3.5 text-center sm:text-left">
                <span className="block text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                  {spec3.label}
                </span>
                <span className="block font-black text-xs sm:text-sm text-neutral-900 mt-0.5 truncate">
                  {spec3.value}
                </span>
              </div>
            </div>

            {/* Desktop In-Page Add to Cart Action */}
            <div className="hidden lg:flex items-center gap-3 pt-2">
              <div className="flex items-center justify-between border border-neutral-200/90 rounded-full h-13 px-4 w-32 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                  disabled={quantity <= 1}
                  className="text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none p-1 cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-base text-neutral-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="text-neutral-500 hover:text-neutral-900 p-1 cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 h-13 rounded-full font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#557754] hover:bg-[#466645] text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to cart!</span>
                  </>
                ) : (
                  <span>Add to cart · ${currentPrice * quantity}</span>
                )}
              </button>
            </div>

            {/* Effects */}
            <div className="space-y-2 pt-1">
              <h3 className="text-sm font-extrabold text-neutral-900">
                Effects
              </h3>
              <div className="flex flex-wrap gap-2">
                {effects.map((effect) => (
                  <span
                    key={effect}
                    className="bg-[#edf4ed] text-[#2F4F30] font-bold text-xs px-3.5 py-1.5 rounded-full"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>

            {/* Flavor */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-neutral-900">
                Flavor
              </h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map((flavor) => (
                  <span
                    key={flavor}
                    className="bg-[#fdf1ea] text-[#E8561E] font-bold text-xs px-3.5 py-1.5 rounded-full"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>

            {/* About this product / strain */}
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-neutral-900">
                {aboutHeading}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                {cleanDescription}
              </p>
            </div>
          </div>
        </div>

        {/* ================= SIMILAR PRODUCTS SUGGESTION SLIDER ================= */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="pt-10 border-t border-neutral-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {similarHeading}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                  Popular recommendations hand-picked for you
                </p>
              </div>

              {/* Slider Arrow Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  className="w-9 h-9 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 shadow-2xs transition-colors cursor-pointer"
                  aria-label="Previous suggestions"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  className="w-9 h-9 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 shadow-2xs transition-colors cursor-pointer"
                  aria-label="Next suggestions"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Slider */}
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {product.relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  className="w-48 sm:w-56 shrink-0 snap-start bg-white border border-neutral-200/80 rounded-2xl p-3 hover:border-[#557754]/40 hover:shadow-sm transition-all flex flex-col group"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-[#edf4ec] overflow-hidden mb-2.5 flex items-center justify-center">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform p-2"
                    />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                    {rel.name.replace(/\s*\(.*\)/, "")}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {rel.strain ? rel.strain.charAt(0).toUpperCase() + rel.strain.slice(1) : "Flower"}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-neutral-900">
                      from ${rel.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= MOBILE FLOATING STICKY ACTION BAR ================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 p-3 z-40 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          {/* Quantity Selector: [ - 1 + ] */}
          <div className="flex items-center justify-between border border-neutral-200/90 rounded-full h-12 px-3.5 w-28 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
              disabled={quantity <= 1}
              className="text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none p-1 cursor-pointer transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-black text-sm text-neutral-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="text-neutral-500 hover:text-neutral-900 p-1 cursor-pointer transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Primary Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 h-12 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99] ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#557754] hover:bg-[#466645] text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to cart!</span>
              </>
            ) : (
              <span>Add to cart · ${currentPrice * quantity}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
