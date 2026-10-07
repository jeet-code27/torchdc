"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface BannerSlide {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  secondaryText?: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  imageAlt: string;
}

const slides: BannerSlide[] = [
  {
    id: "wake-and-bake",
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
  },
  {
    id: "exotic-indoor",
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
  },
];

export function StoreHeroCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const active = slides[currentSlide];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
      {/* ================= HERO CONTAINER ================= */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#557754] text-white shadow-md">
        <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[390px] flex items-center px-6 sm:px-12 lg:px-16 py-8 sm:py-10">
          {/* Left / Text Side */}
          <div className="z-10 max-w-md flex flex-col items-start space-y-3 sm:space-y-4">
            {/* Tag Badge */}
            <span
              className={`${active.badgeColor || "bg-[#f95721]"} text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs`}
            >
              {active.badge}
            </span>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] whitespace-pre-line uppercase drop-shadow-xs">
              {active.title}
            </h1>

            {/* Subtitle & Limit Note (under $50) */}
            <div className="flex flex-col space-y-1 pt-1 text-white">
              <p className="text-sm sm:text-base font-semibold leading-normal">
                {active.subtitle}
              </p>
              {active.secondaryText && (
                <p className="text-xs sm:text-sm font-medium text-white/80">
                  {active.secondaryText}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <Link
                href={active.ctaLink}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#2563eb] font-extrabold text-sm sm:text-base px-6 py-2.5 sm:py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 group"
              >
                <span>{active.ctaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right / Product Image Graphic */}
          <div className="absolute right-2 sm:right-6 lg:right-12 bottom-0 top-0 flex items-center justify-end w-1/2 sm:w-7/12 pointer-events-none select-none">
            <div className="relative w-full h-[85%] max-h-[340px]">
              <Image
                src={active.image}
                alt={active.imageAlt}
                fill
                sizes="(max-width: 768px) 60vw, 450px"
                className="object-contain object-right drop-shadow-2xl"
                priority
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Desktop Navigation Arrows (< and >) */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={next}
          aria-label="Next slide"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-800 items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Indicators (Dots) */}
      <div className="flex items-center justify-center gap-2 pt-3 pb-1">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === index
                ? "w-6 h-2 bg-[#557754]"
                : "w-2 h-2 bg-[#d1ddd1] hover:bg-[#b0c4b0]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
