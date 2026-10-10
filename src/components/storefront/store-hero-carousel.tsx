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
    }
  | {
      id: string;
      type: "night-sky";
      badge: string;
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
    };

const slides: BannerSlide[] = [
  {
    id: "wake-and-bake",
    type: "text",
    badge: "9AM TO 12PM DAILY",
    badgeColor: "bg-[#E8561E]",
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
    id: "light-up-late",
    type: "night-sky",
    badge: "OPEN LATE",
    title: "LIGHT UP\nLATE",
    subtitle: "We deliver till 11PM.",
    ctaText: "Order now",
    ctaLink: "/shop",
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

interface StoreHeroCarouselProps {
  className?: string;
  compact?: boolean;
}

export function StoreHeroCarousel({
  className = "",
  compact = false,
}: StoreHeroCarouselProps = {}) {
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

  const heightClass = "h-[260px] sm:h-[340px] lg:h-[390px]";

  return (
    <div className={`w-full ${className}`}>
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
                  className={`min-w-full w-full ${heightClass} relative bg-white flex items-center justify-center overflow-hidden`}
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

            // Night Sky / Light Up Late Slide
            if (slide.type === "night-sky") {
              return (
                <div
                  key={slide.id}
                  className={`min-w-full w-full ${heightClass} relative text-white flex items-center px-6 sm:px-10 lg:px-12 overflow-hidden`}
                  style={{
                    background: "linear-gradient(165deg, #0B0C0B 0%, #1A1B1A 55%, #2C2E2C 100%)",
                  }}
                >
                  {/* Background Panoramic Night Sky SVG */}
                  <svg
                    viewBox="-300 0 658 236"
                    preserveAspectRatio="xMaxYMax slice"
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  >
                    <defs>
                      <radialGradient id="mglowL" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0" stopColor="#FFF4DE" stopOpacity="0.45" />
                        <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="hazeL" cx="0.75" cy="1" r="0.8">
                        <stop offset="0" stopColor="#E9DFC9" stopOpacity="0.10" />
                        <stop offset="1" stopColor="#E9DFC9" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="shoot2L" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
                      </linearGradient>
                      <mask id="moonCutL">
                        <rect x="0" y="0" width="358" height="236" fill="#FFFFFF" />
                        <circle cx="312" cy="48" r="24" fill="#000000" />
                      </mask>
                    </defs>
                    <rect x="-300" y="0" width="658" height="236" fill="url(#hazeL)" />
                    <g>
                      <circle cx="-9.2" cy="189.9" r="0.8" fill="#FFFFFF" opacity="0.31" />
                      <circle cx="-84.6" cy="78.3" r="1" fill="#FFFFFF" opacity="0.37" />
                      <circle cx="-12.0" cy="24.8" r="1.2" fill="#FFFFFF" opacity="0.57" />
                      <circle cx="-63.1" cy="159.1" r="1.2" fill="#FFFFFF" opacity="0.65" />
                      <circle cx="162.3" cy="91.3" r="1.2" fill="#FFFFFF" opacity="0.62" />
                      <circle cx="303.3" cy="33.6" r="1.6" fill="#FFFFFF" opacity="0.64" />
                      <circle cx="218.9" cy="33.0" r="1.2" fill="#FFFFFF" opacity="0.53" />
                      <circle cx="35.7" cy="130.3" r="0.8" fill="#FFFFFF" opacity="0.71" />
                      <circle cx="142.7" cy="74.7" r="1.6" fill="#FFFFFF" opacity="0.74" />
                      <circle cx="70.6" cy="41.7" r="0.8" fill="#FFFFFF" opacity="0.82" />
                      <circle cx="118.2" cy="96.2" r="1" fill="#FFFFFF" opacity="0.66" />
                      <circle cx="228.1" cy="82.0" r="0.8" fill="#FFFFFF" opacity="0.62" />
                      <circle cx="101.4" cy="159.6" r="0.8" fill="#FFFFFF" opacity="0.77" />
                      <circle cx="328.5" cy="12.2" r="1.2" fill="#FFFFFF" opacity="0.94" />
                      <circle cx="199.8" cy="73.8" r="1" fill="#FFFFFF" opacity="0.94" />
                      <circle cx="273.3" cy="69.4" r="1.2" fill="#FFFFFF" opacity="0.42" />
                      <circle cx="345.2" cy="96.5" r="0.8" fill="#FFFFFF" opacity="0.48" />
                      <circle cx="350.3" cy="37.3" r="1" fill="#FFFFFF" opacity="0.36" />
                      <circle cx="133.0" cy="101.1" r="1" fill="#FFFFFF" opacity="0.93" />
                      <circle cx="70.4" cy="119.4" r="1.6" fill="#FFFFFF" opacity="0.47" />
                      <circle cx="256.1" cy="14.7" r="1" fill="#FFFFFF" opacity="0.64" />
                      <circle cx="325.1" cy="35.8" r="0.8" fill="#FFFFFF" opacity="0.39" />
                      <circle cx="52.4" cy="74.3" r="1" fill="#FFFFFF" opacity="0.74" />
                      <circle cx="245.9" cy="95.2" r="1" fill="#FFFFFF" opacity="0.70" />
                      <circle cx="327.3" cy="78.1" r="1" fill="#FFFFFF" opacity="0.77" />
                      <circle cx="324.3" cy="58.9" r="1.2" fill="#FFFFFF" opacity="0.89" />
                      <circle cx="204.5" cy="101.5" r="1.2" fill="#FFFFFF" opacity="0.58" />
                      <circle cx="261.3" cy="94.6" r="1.2" fill="#FFFFFF" opacity="0.63" />
                    </g>
                    <path d="M168 22 L212 38" stroke="url(#shoot2L)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="300" cy="56" r="58" fill="url(#mglowL)" />
                    <circle cx="300" cy="56" r="26" fill="#FFF4DE" mask="url(#moonCutL)" />
                    <g fill="none" stroke="#E9DFC9" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
                      <path d="M-300 234 H0 M-124 234 V222 H-104 V216 H-90 V222 H-76 V212 H-60 V234 M-40 234 V224 H-20 V234" />
                      <path d="M0 234 H358" />
                      <path d="M0 234 V220 H16 V214 H30 V220 H42 V212 H58 V234" />
                      <path d="M176 234 V204 H188 V198 L194 192 L200 198 V204 H212 V196 H226 V234 M188 204 V234 M212 204 V234" />
                      <path d="M234 234 V106 L240 92 L246 106 V234" />
                      <path d="M254 234 V200 H262 V188 H274 V200 H280 V234" />
                      <path d="M284 234 V206 H358 M292 206 V198 H350 V206 M298 198 V190 H344 V198 M301 190 A20 20 0 0 1 341 190 M316 170 H326 V164 L321 156 L316 164 Z" />
                      <path d="M300 206 V234 M312 206 V234 M330 206 V234 M342 206 V234" />
                    </g>
                    <g fill="#FFC56B" opacity="0.9">
                      <rect x="182" y="210" width="3" height="4" />
                      <rect x="204" y="212" width="3" height="4" />
                      <rect x="218" y="202" width="3" height="4" />
                      <rect x="218" y="214" width="3" height="4" />
                      <rect x="258" y="206" width="3" height="4" />
                      <rect x="268" y="194" width="3" height="4" />
                      <rect x="304" y="214" width="3" height="4" />
                      <rect x="334" y="214" width="3" height="4" />
                      <rect x="20" y="224" width="3" height="4" />
                      <rect x="48" y="218" width="3" height="4" />
                    </g>
                  </svg>

                  {/* Left / Text Side */}
                  <div className="z-10 max-w-xs sm:max-w-md flex flex-col items-start space-y-1.5 sm:space-y-3">
                    <span className="bg-[#E8561E] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                      {slide.badge}
                    </span>

                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] whitespace-pre-line uppercase drop-shadow-xs text-white">
                      {slide.title}
                    </h2>

                    <div className="flex flex-col space-y-0.5 sm:space-y-1 text-white">
                      <p className="text-xs sm:text-sm font-semibold leading-normal">
                        {slide.subtitle}
                      </p>
                    </div>

                    <div className="pt-1 sm:pt-2">
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 group/btn cursor-pointer"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            // Text Banner Slide
            return (
              <div
                key={slide.id}
                className={`min-w-full w-full ${heightClass} relative ${
                  slide.bgColor || "bg-[#557754]"
                } text-white flex items-center px-6 sm:px-10 lg:px-12 overflow-hidden`}
              >
                {/* Left / Text Side */}
                <div className="z-10 max-w-xs sm:max-w-md flex flex-col items-start space-y-1.5 sm:space-y-3">
                  <span
                    className={`${
                      slide.badgeColor || "bg-[#E8561E]"
                    } text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs`}
                  >
                    {slide.badge}
                  </span>

                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] whitespace-pre-line uppercase drop-shadow-xs">
                    {slide.title}
                  </h2>

                  <div className="flex flex-col space-y-0.5 sm:space-y-1 text-white">
                    <p className="text-xs sm:text-sm font-semibold leading-normal">
                      {slide.subtitle}
                    </p>
                    {slide.secondaryText && (
                      <p className="text-[10px] sm:text-xs font-medium text-white/80">
                        {slide.secondaryText}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 sm:pt-2">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs sm:text-sm px-5 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 group/btn cursor-pointer"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
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
