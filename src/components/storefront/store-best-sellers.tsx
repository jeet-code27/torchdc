"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { useCart } from "@/context/cart-context";

export interface SliderProduct {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number;
  image: string;
}

const BEST_SELLER_PRODUCTS: SliderProduct[] = [
  {
    id: "bs-1",
    name: "Gelato (Hybrid)",
    slug: "gelato-hybrid",
    subtitle: "Topshelf · Hybrid · from",
    price: 40,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
  },
  {
    id: "bs-2",
    name: "2G Plume Sweet Pop",
    slug: "2g-plume-sweet-pop-berry-runtz-x-fruit-tart",
    subtitle: "Berry Runtz x Fruit Tart",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
  },
  {
    id: "bs-3",
    name: "Rocket Bites Orange Sun",
    slug: "rocket-bites-orange-sun-gummies-200mg-10ct",
    subtitle: "200mg · 10 ct Artisanal",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
  },
  {
    id: "bs-4",
    name: "Exotic 1G Pre-Rolls",
    slug: "exotic-1g-pre-rolls",
    subtitle: "Pre-roll · 1g Artisanal",
    price: 15,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
  },
  {
    id: "bs-5",
    name: "Lemon Cherry Gelato (Hybrid)",
    slug: "lemon-cherry-gelato-hybrid",
    subtitle: "Private Reserve · from",
    price: 60,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362261/torch/products/k3eyozayonkk2k8qisj3.jpg",
  },
  {
    id: "bs-6",
    name: "Jealousy (Hybrid)",
    slug: "jealousy-hybrid",
    subtitle: "Top Shelf · Potent Hybrid",
    price: 70,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362257/torch/products/awsajtrozoidcmlc6mu5.jpg",
  },
  {
    id: "bs-7",
    name: "Blue Zushi (Hybrid)",
    slug: "blue-zushi-hybrid",
    subtitle: "Exotic Zkittlez x Kush Mints",
    price: 70,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362257/torch/products/onkbeyx4fgdlr7gc0whe.jpg",
  },
  {
    id: "bs-8",
    name: "Obama Runtz (Hybrid)",
    slug: "obama-runtz-hybrid",
    subtitle: "Sweet Fruity & Gas Profile",
    price: 70,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362258/torch/products/ndtpyltiaqra6zrs4tof.jpg",
  },
  {
    id: "bs-9",
    name: "Mendo Breath (Indica)",
    slug: "mendo-breath-indica",
    subtitle: "OGKB x Mendo Montage",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362261/torch/products/k17spictk5rpxjh0squl.png",
  },
  {
    id: "bs-10",
    name: "Blackberry Kush (Indica)",
    slug: "blackberry-kush-indica",
    subtitle: "Afghani x Blackberry",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362264/torch/products/e4mvdqbfzjsal0h0cpyl.png",
  },
  {
    id: "bs-11",
    name: "OG Master Kush (Indica)",
    slug: "og-master-kush-indica",
    subtitle: "Master Kush x Hindu Kush",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362264/torch/products/n8bcomkhkmu2d4aliuei.png",
  },
  {
    id: "bs-12",
    name: "Gary Payton (Hybrid)",
    slug: "gary-payton-hybrid",
    subtitle: "Powerzzz Genetics Signature",
    price: 210,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362261/torch/products/z0op1sancok6ksopn3st.jpg",
  },
];

export function StoreBestSellers() {
  const { addItem } = useCart();
  const { ref: scrollRef, events: dragEvents } = useDragScroll();
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scrollRef]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header: Title on Left, Controls & See All on Right */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Best Sellers
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Arrow Buttons for Laptop/Desktop */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${canScrollLeft
                  ? "bg-white text-gray-800 hover:bg-gray-100 shadow-2xs cursor-pointer active:scale-95"
                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Next products"
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${canScrollRight
                  ? "bg-white text-gray-800 hover:bg-gray-100 shadow-2xs cursor-pointer active:scale-95"
                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/shop?sort=best-sellers"
            className="text-xs sm:text-sm font-bold text-[#5A805B] hover:text-[#415e40] hover:underline transition-colors"
          >
            See all
          </Link>
        </div>
      </div>

      {/* Slider Carousel Track with Native Snap + Desktop Click-and-Drag Swipe */}
      <div
        ref={scrollRef}
        {...dragEvents}
        className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
      >
        {BEST_SELLER_PRODUCTS.map((item) => (
          <div
            key={item.id}
            className="w-[170px] sm:w-[200px] md:w-[220px] lg:w-[225px] shrink-0 snap-start group relative flex flex-col justify-between"
          >
            {/* The Entire Card Box Is Clickable (Image, Title, Subtitle, Price) */}
            <Link
              href={`/product/${item.slug}`}
              className="flex flex-col h-full cursor-pointer focus:outline-none"
              title={`View ${item.name}`}
            >
              {/* Pure White Card Graphic Container with Flame */}
              <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 flex items-center justify-center transition-all duration-300 border border-gray-100/90 shadow-2xs group-hover:shadow-md">
                {/* Top Left Flame Badge */}
                <span
                  className="absolute top-2.5 left-2.5 text-base select-none pointer-events-none drop-shadow-xs z-10"
                  role="img"
                  aria-label="hot"
                >
                  🔥
                </span>

                {/* Product Image */}
                <div className="relative w-full h-full max-h-[160px] sm:max-h-[175px] flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                    className="object-contain p-1 mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Product Meta Below Card */}
              <div className="pt-2.5 px-0.5 space-y-1">
                <h3 className="font-extrabold text-[13px] sm:text-sm text-gray-900 line-clamp-1 group-hover:text-[#5A805B] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-1">
                  {item.subtitle}
                </p>

                {/* Price Display */}
                <div className="pt-1">
                  <span className="font-black text-sm sm:text-base text-gray-900">
                    ${item.price}
                  </span>
                </div>
              </div>
            </Link>

            {/* Floating Add Pill Button (Isolated click handler so clicking Add doesn't trigger navigation) */}
            <div className="absolute bottom-0 right-0 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                  });
                  toast.success(`Added ${item.name} to cart!`);
                }}
                aria-label={`Add ${item.name} to cart`}
                className="bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs font-extrabold px-3.5 sm:px-4 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
