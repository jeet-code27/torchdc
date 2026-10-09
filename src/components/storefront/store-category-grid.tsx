"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "flowers",
    name: "FLOWERS",
    slug: "flowers",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349254/torch/categories/hc9na7l6op0v2boshuh1.png",
  },
  {
    id: "pre-rolls",
    name: "PRE-ROLLS",
    slug: "pre-rolls",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349257/torch/categories/klbrtn83a7r3duyyv2o3.jpg",
  },
  {
    id: "disposables",
    name: "DISPOSABLES",
    slug: "disposables",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349258/torch/categories/lf2ds9mohuoixwdrl4ri.jpg",
  },
  {
    id: "concentrates",
    name: "CONCENTRATES",
    slug: "concentrates",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349260/torch/categories/oqss4sy7kolhfwcg3kjn.jpg",
  },
  {
    id: "edibles",
    name: "EDIBLES",
    slug: "edibles",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349263/torch/categories/xmal5v2rlltdqdopq4o4.jpg",
  },
  {
    id: "mushrooms",
    name: "MUSHROOMS",
    slug: "mushrooms",
    image:
      "https://res.cloudinary.com/omtao1np/image/upload/v1791349265/torch/categories/t45kec3opwajrg8draun.jpg",
  },
];

export function StoreCategoryGrid() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Shop By Category
        </h2>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-bold text-[#5A805B] hover:text-[#415e40] hover:underline transition-colors"
        >
          Browse all
        </Link>
      </div>

      {/* Grid: 3 columns on mobile (as in reference screenshot) and 6 columns on md+ screens */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {DEFAULT_CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center bg-white rounded-2xl sm:rounded-3xl border border-gray-100/90 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 p-3 sm:p-4 text-center cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-square max-w-[90px] sm:max-w-[120px] mb-2 sm:mb-3 flex items-center justify-center">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 28vw, (max-width: 1024px) 15vw, 130px"
                className="object-contain p-1 group-hover:scale-108 transition-transform duration-300"
              />
            </div>

            {/* Title */}
            <span className="text-[11px] sm:text-xs lg:text-[13px] font-extrabold text-[#2a4429] group-hover:text-[#5A805B] tracking-wide uppercase leading-tight line-clamp-1 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
