"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface AboutStorefrontViewProps {
  counts?: {
    midshelf: number;
    topshelf: number;
    exotic: number;
  };
}

export function AboutStorefrontView({
  counts = { midshelf: 7, topshelf: 20, exotic: 8 },
}: AboutStorefrontViewProps) {
  const router = useRouter();
  const { setFulfillment, isPickupEnabled } = useCart();

  const handleOrderDelivery = () => {
    setFulfillment("delivery");
    router.push("/shop");
  };

  const handleOrderPickup = () => {
    setFulfillment("pickup");
    if (isPickupEnabled) {
      router.push("/shop");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12 sm:space-y-14">
      {/* ================= 1. HERO CARD (Screenshot 1 Exact Match) ================= */}
      <section className="bg-[#edf4ec] rounded-[26px] sm:rounded-[32px] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 max-w-lg">
          <span className="text-[#D96B27] font-black text-xs uppercase tracking-wider block">
            ABOUT TORCH
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#2F4F30] tracking-tight leading-tight">
            DC&apos;s cannabis, done right.
          </h1>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed pt-1">
            Hand-picked products, real expertise and fast, discreet delivery from Downtown DC.
          </p>
        </div>

        {/* Hero Product Artwork (Bud + Torch Jar) */}
        <div className="shrink-0 relative w-44 h-32 sm:w-52 sm:h-36 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/omtao1np/image/upload/v1791449528/torch/products/s3l1uzq574mjurou0vev.png"
              alt="Torch Premium Hand-Picked DC Cannabis"
              fill
              sizes="(max-width: 640px) 180px, 220px"
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>
      </section>

      {/* ================= 2. OUR STORY SECTION ================= */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Our story
        </h2>

        <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed">
          <p>
            Torch started with a simple idea: buying cannabis in DC should feel easy, safe and
            welcoming. We hand-pick every strain, keep our menu organized by tier so you always
            know what you&apos;re getting, and train our team to help first-timers and
            connoisseurs alike.
          </p>
          <p>
            Today we serve neighborhoods across the District from our location at 1000 G St NW,
            with free delivery and curbside pickup seven days a week.
          </p>
        </div>

        {/* 4 Feature Value Pillars (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-3">
          {/* Card 1 */}
          <div className="bg-[#f2f6f2] rounded-2xl p-5 sm:p-6 space-y-1.5 border border-[#e4ede4]">
            <div className="w-6 h-6 rounded-full bg-[#5A805B] text-white flex items-center justify-center mb-2 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">
              Hand-picked
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Every strain is chosen by our team.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#f2f6f2] rounded-2xl p-5 sm:p-6 space-y-1.5 border border-[#e4ede4]">
            <div className="w-6 h-6 rounded-full bg-[#5A805B] text-white flex items-center justify-center mb-2 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">
              Real experts
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Staff who help you find the right strain and dose.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#f2f6f2] rounded-2xl p-5 sm:p-6 space-y-1.5 border border-[#e4ede4]">
            <div className="w-6 h-6 rounded-full bg-[#5A805B] text-white flex items-center justify-center mb-2 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">
              Discreet delivery
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Free, fast and in unmarked packaging.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#f2f6f2] rounded-2xl p-5 sm:p-6 space-y-1.5 border border-[#e4ede4]">
            <div className="w-6 h-6 rounded-full bg-[#5A805B] text-white flex items-center justify-center mb-2 shadow-2xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-900">
              Community
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600">
              Education, workshops and local giving.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 3. THREE TIERS, ZERO GUESSWORK (Screenshot 2 Match) ================= */}
      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Three tiers, zero guesswork
        </h2>

        <div className="space-y-3">
          {/* Midshelf */}
          <Link
            href="/shop?category=flowers&tier=midshelf"
            className="group bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#5A805B]/60 hover:shadow-xs transition-all"
          >
            <div>
              <h4 className="font-extrabold text-[15px] sm:text-base text-neutral-900 group-hover:text-[#5A805B] transition-colors">
                Midshelf
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Quality picks, priced for value
              </p>
            </div>
            <span className="bg-neutral-100 group-hover:bg-[#5A805B]/10 group-hover:text-[#5A805B] text-neutral-700 text-xs font-bold px-3 py-1 rounded-full transition-colors shrink-0">
              {counts.midshelf} strains
            </span>
          </Link>

          {/* Topshelf */}
          <Link
            href="/shop?category=flowers&tier=topshelf"
            className="group bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#5A805B]/60 hover:shadow-xs transition-all"
          >
            <div>
              <h4 className="font-extrabold text-[15px] sm:text-base text-neutral-900 group-hover:text-[#5A805B] transition-colors">
                Topshelf
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Our core lineup of classics
              </p>
            </div>
            <span className="bg-neutral-100 group-hover:bg-[#5A805B]/10 group-hover:text-[#5A805B] text-neutral-700 text-xs font-bold px-3 py-1 rounded-full transition-colors shrink-0">
              20+ strains
            </span>
          </Link>

          {/* Private Reserve */}
          <Link
            href="/shop?category=flowers&tier=exotic"
            className="group bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-[#5A805B]/60 hover:shadow-xs transition-all"
          >
            <div>
              <h4 className="font-extrabold text-[15px] sm:text-base text-neutral-900 group-hover:text-[#5A805B] transition-colors">
                Private Reserve
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Small-batch exotics
              </p>
            </div>
            <span className="bg-neutral-100 group-hover:bg-[#5A805B]/10 group-hover:text-[#5A805B] text-neutral-700 text-xs font-bold px-3 py-1 rounded-full transition-colors shrink-0">
              {counts.exotic} strains
            </span>
          </Link>
        </div>
      </section>

      {/* ================= 4. READY WHEN YOU ARE (Bottom CTA Banner) ================= */}
      <section className="bg-[#edf4ec] rounded-[26px] sm:rounded-[32px] p-8 sm:p-12 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2F4F30] tracking-tight">
          Ready when you are.
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleOrderDelivery}
            style={{ backgroundColor: "#5A805B", color: "#ffffff" }}
            className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-full bg-[#5A805B] hover:brightness-95 active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            ORDER DELIVERY
          </button>
          <button
            type="button"
            onClick={handleOrderPickup}
            style={{ backgroundColor: "#111827", color: "#ffffff" }}
            className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-full bg-[#111827] hover:bg-black active:scale-95 text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            ORDER PICKUP
          </button>
        </div>
      </section>
    </div>
  );
}
