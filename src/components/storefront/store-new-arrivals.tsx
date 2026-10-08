"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SliderProduct } from "./store-best-sellers";
import { useDragScroll } from "@/hooks/use-drag-scroll";

const NEW_ARRIVAL_PRODUCTS: SliderProduct[] = [
  {
    id: "na-1",
    name: "Platinum (Indica)",
    slug: "platinum-indica",
    subtitle: "Dense Trichome Heavyweight",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362264/torch/products/gp6mpirtvdzyeub9xcfc.png",
  },
  {
    id: "na-2",
    name: "God’s Gift (Indica)",
    slug: "gods-gift-indica",
    subtitle: "Granddaddy Purple x OG Kush",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362268/torch/products/ralsjh8eidjql7vm2glk.png",
  },
  {
    id: "na-3",
    name: "Garlic Cookies (Indica)",
    slug: "garlic-cookies-indica",
    subtitle: "Pungent Chem Dog Lineage",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362268/torch/products/d96nyrqqntj56ewgjtg6.png",
  },
  {
    id: "na-4",
    name: "GMO (Indica)",
    slug: "gmo-indica",
    subtitle: "Ultra High Potency Cut",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362268/torch/products/j7opramrenptxr0hcha0.png",
  },
  {
    id: "na-5",
    name: "Confidential (Indica)",
    slug: "confidential-indica",
    subtitle: "LA Affie x Afghani Indica",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362271/torch/products/vzbjlgwpuyuj1blejm0a.png",
  },
  {
    id: "na-6",
    name: "LA (Indica)",
    slug: "la-indica",
    subtitle: "Legendary Southern California",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362271/torch/products/uvmyyvhoglmo5kr8djj5.png",
  },
  {
    id: "na-7",
    name: "OG Death Star (Indica)",
    slug: "og-death-star-indica",
    subtitle: "Sensi Star x Sour Diesel",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362271/torch/products/le7bhxg882yxhmjwmfq4.png",
  },
  {
    id: "na-8",
    name: "Skywalker (Indica)",
    slug: "skywalker-indica",
    subtitle: "Mazar x Blueberry Classic",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362274/torch/products/pgwsojynixlcmwimcy0h.png",
  },
  {
    id: "na-9",
    name: "Purple Kush (Indica)",
    slug: "purple-kush-indica",
    subtitle: "Hindu Kush x Purple Afghani",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362274/torch/products/otoqtzjqjhjwxkfvhiyo.png",
  },
  {
    id: "na-10",
    name: "Bubba Kush (Indica)",
    slug: "bubba-kush-indica",
    subtitle: "Deep Coffee & Chocolate Terps",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362274/torch/products/fou8vbawltgablah4bvu.png",
  },
  {
    id: "na-11",
    name: "Granddaddy Purple (GDP)",
    slug: "granddaddy-purple-gdp-indica",
    subtitle: "Big Bud x Purple Urkle",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362277/torch/products/pknrxp05wj8tge5nm6vq.png",
  },
  {
    id: "na-12",
    name: "Hindu Kush (Indica)",
    slug: "hindu-kush-indica",
    subtitle: "100% Pure Landrace Indica",
    price: 149,
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362278/torch/products/zguo69yaoxgodaiwen9z.png",
  },
];

export function StoreNewArrivals() {
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
            New Arrivals
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Arrow Buttons for Laptop/Desktop */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous new arrivals"
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
              aria-label="Next new arrivals"
              className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${canScrollRight
                  ? "bg-white text-gray-800 hover:bg-gray-100 shadow-2xs cursor-pointer active:scale-95"
                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/shop?sort=newest"
            className="text-xs sm:text-sm font-bold text-[#557754] hover:text-[#415e40] hover:underline transition-colors"
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
        {NEW_ARRIVAL_PRODUCTS.map((item) => (
          <div
            key={item.id}
            className="w-[170px] sm:w-[200px] md:w-[220px] lg:w-[225px] shrink-0 snap-start group flex flex-col justify-between"
          >
            {/* Pure White Card Graphic Container with Sparkle */}
            <Link
              href={`/product/${item.slug}`}
              className="relative w-full aspect-square bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 flex items-center justify-center transition-all duration-300 border border-gray-100/90 shadow-2xs group-hover:shadow-md cursor-pointer"
            >
              {/* Top Left Sparkle Badge */}
              <span
                className="absolute top-2.5 left-2.5 text-base select-none pointer-events-none drop-shadow-xs z-10"
                role="img"
                aria-label="new"
              >
                ✨
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
            </Link>

            {/* Product Meta & Actions Below Card */}
            <div className="pt-2.5 px-0.5 space-y-1">
              <Link href={`/product/${item.slug}`}>
                <h3 className="font-extrabold text-[13px] sm:text-sm text-gray-900 line-clamp-1 group-hover:text-[#557754] transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium line-clamp-1">
                {item.subtitle}
              </p>

              {/* Price & Add Pill Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-black text-sm sm:text-base text-gray-900">
                  ${item.price}
                </span>

                <button
                  type="button"
                  aria-label={`Add ${item.name} to cart`}
                  className="bg-black hover:bg-neutral-800 active:scale-95 text-white text-xs font-extrabold px-3.5 sm:px-4 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
