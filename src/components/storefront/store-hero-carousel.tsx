"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export type BannerSlide =
  | {
      id: string;
      type: "text";
      badge: string;
      badgeColor?: string;
      title: string;
      subtitle: string;
      secondaryText?: string;
      ctaText: string;
      ctaLink: string;
      image: string;
      imageAlt: string;
      bgColor?: string;
    }
  | {
      id: string;
      type: "image";
      image: string;
      alt: string;
      link?: string;
    };

const slides: BannerSlide[] = [
  {
    id: "wake-and-bake",
    type: "text",
    badge: "9AM TO 12PM DAILY",
    badgeColor: "bg-[#f95721]",
    title: "WAKE &\nBAKE",
    subtitle: "Half ounce from $50.",
    secondaryText: "Limit 1 per customer daily.",
    ctaText: "Grab it",
    ctaLink: "/deals",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
    imageAlt: "Torch Wake and Bake Cannabis Special",
    bgColor: "bg-[#557754]",
  },
  {
    id: "free-delivery-graphic",
    type: "image",
    image: "/images/banner4.jpeg",
    alt: "Torch Free Delivery - Fast, reliable and discreet delivery straight to your door. Open Daily 7AM-11PM",
    link: "/#shop",
  },
  {
    id: "exotic-indoor",
    type: "text",
    badge: "TOP SHELF SPECIAL",
    badgeColor: "bg-[#10b981]",
    title: "EXOTIC\nINDOOR",
    subtitle: "Private Reserve strains.",
    secondaryText: "Tested for purity & max potency.",
    ctaText: "Shop Exotics",
    ctaLink: "/category/flowers",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791362264/torch/products/n8bcomkhkmu2d4aliuei.png",
    imageAlt: "Torch Exotic Indoor Flower Special",
    bgColor: "bg-[#557754]",
  },
];

export function StoreHeroCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const touchStartX = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  // Autoplay every 5.5 seconds (pauses on hover)
  React.useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
      {/* ================= HERO SLIDER CONTAINER ================= */}
      <div
        className="relative overflow-hidden rounded-[22px] sm:rounded-[32px] lg:rounded-[36px] bg-[#557754] shadow-md group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => {
            if (slide.type === "image") {
              return (
                <div
                  key={slide.id}
                  className="min-w-full w-full h-[260px] sm:h-[340px] lg:h-[390px] relative bg-white flex items-center justify-center overflow-hidden"
                >
                  {slide.link ? (
                    <Link
                      href={slide.link}
                      className="block w-full h-full relative cursor-pointer"
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="object-contain object-center"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="object-contain object-center"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                      />
                    </div>
                  )}
                </div>
              );
            }

            // Text Banner Slide
            return (
              <div
                key={slide.id}
                className={`min-w-full w-full h-[260px] sm:h-[340px] lg:h-[390px] relative ${
                  slide.bgColor || "bg-[#557754]"
                } text-white flex items-center px-6 sm:px-12 lg:px-16 overflow-hidden`}
              >
                {/* Left / Text Side */}
                <div className="z-10 max-w-xs sm:max-w-md flex flex-col items-start space-y-2 sm:space-y-4">
                  <span
                    className={`${
                      slide.badgeColor || "bg-[#f95721]"
                    } text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs`}
                  >
                    {slide.badge}
                  </span>

                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] whitespace-pre-line uppercase drop-shadow-xs">
                    {slide.title}
                  </h2>

                  <div className="flex flex-col space-y-0.5 sm:space-y-1 text-white">
                    <p className="text-xs sm:text-base font-semibold leading-normal">
                      {slide.subtitle}
                    </p>
                    {slide.secondaryText && (
                      <p className="text-[11px] sm:text-sm font-medium text-white/80">
                        {slide.secondaryText}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 sm:pt-3">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#2563eb] font-extrabold text-xs sm:text-base px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 group/btn"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Right / Product Jar/Flower Cutout Graphic */}
                <div className="absolute right-2 sm:right-6 lg:right-12 bottom-0 top-0 flex items-center justify-end w-1/2 sm:w-7/12 pointer-events-none select-none">
                  <div className="relative w-full h-[85%] max-h-[340px]">
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      sizes="(max-width: 768px) 50vw, 450px"
                      className="object-contain object-right drop-shadow-2xl"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md border border-gray-100 transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 z-20 cursor-pointer backdrop-blur-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-md border border-gray-100 transition-all hover:scale-105 active:scale-95 opacity-0 group-hover:opacity-100 z-20 cursor-pointer backdrop-blur-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Indicators (Dots) */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2.5 pb-1">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === index
                  ? "w-6 bg-[#557754]"
                  : "w-2 bg-[#d1ddd1] hover:bg-[#b0c4b0]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
