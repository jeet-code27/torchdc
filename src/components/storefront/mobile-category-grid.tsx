"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

const MOBILE_CATEGORIES = [
  {
    name: "FLOWERS",
    slug: "flowers",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
  },
  {
    name: "PRE-ROLLS",
    slug: "pre-rolls",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
  },
  {
    name: "DISPOSABLES",
    slug: "disposables",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
  },
  {
    name: "CONCENTRATES",
    slug: "concentrates",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349260/torch/categories/oqss4sy7kolhfwcg3kjn.jpg",
  },
  {
    name: "EDIBLES",
    slug: "edibles",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
  },
  {
    name: "MUSHROOMS",
    slug: "mushrooms",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349265/torch/categories/t45kec3opwajrg8draun.jpg",
  },
];

export function MobileCategoryGrid() {
  return (
    <section className="lg:hidden space-y-3 pt-1">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Shop By Category
        </h2>
        <Link
          href="/shop"
          className="text-xs font-bold text-[#5A805B] hover:underline"
        >
          Browse all
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {MOBILE_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="bg-white rounded-[22px] sm:rounded-2xl p-2.5 sm:p-3 border border-neutral-100 shadow-xs flex flex-col items-center justify-between aspect-square hover:border-[#5A805B]/30 hover:shadow-sm transition-all group active:scale-95"
          >
            <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="100px"
                  className="object-contain mix-blend-multiply"
                />
              </div>
            </div>
            <span className="font-extrabold text-[11px] sm:text-xs text-[#2F4F30] tracking-wide text-center uppercase mt-1 shrink-0">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
