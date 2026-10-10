import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Torch Dispensary Washington DC",
  description:
    "Contact Torch Dispensary in Washington D.C. Call or text (202) 468-1966. Curbside pickup at 1025 F St NW. Open daily 7AM - 11PM.",
};

export default function ContactPage() {
  return (
    <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        {/* ================= HEADER SECTION ================= */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#EEF5EE] text-[#5A805B]">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
            We&apos;re Here to Help
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
            Have a question about your delivery, DC gifting laws, or product recommendations? Reach out anytime.
          </p>
        </div>

        {/* ================= 3 INFO CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* 1. Phone Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EEF5EE] text-[#5A805B] flex items-center justify-center mb-5">
                <Phone className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#111111]">
                Call or Text
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Live dispatchers ready daily
              </p>
            </div>
            <div className="pt-5 mt-auto">
              <a
                href="tel:+12024681966"
                className="inline-block text-base sm:text-lg font-black text-[#5A805B] hover:underline tracking-tight"
              >
                (202) 468-1966
              </a>
            </div>
          </div>

          {/* 2. Pickup Location Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#E88A1E] flex items-center justify-center mb-5">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#111111]">
                Pickup Location
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Curbside & in-store pickup
              </p>
            </div>
            <div className="pt-5 mt-auto">
              <a
                href="https://maps.google.com/?q=1025+F+St+NW,+Washington,+DC+20004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm sm:text-base font-bold text-[#111111] hover:text-[#5A805B] transition-colors leading-snug"
              >
                1025 F St NW, Washington, DC 20004
              </a>
            </div>
          </div>

          {/* 3. Store Hours Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F6EEFF] text-[#8C52FF] flex items-center justify-center mb-5">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#111111]">
                Store Hours
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                365 days a year
              </p>
            </div>
            <div className="pt-5 mt-auto">
              <p className="text-sm sm:text-base font-bold text-[#111111] leading-snug">
                Open Daily 7:00 AM – 11:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM CALLOUT BANNER ================= */}
        <div className="rounded-3xl bg-[#EEF5EE] p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1 text-left max-w-xl">
            <h3 className="text-lg sm:text-xl font-bold text-[#111111]">
              Ready to place your order?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Average delivery time across DC is 35 to 45 minutes with cash on delivery.
            </p>
          </div>
          <Link
            href="/shop"
            className="px-6 sm:px-7 py-3 rounded-full bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-sm shrink-0 active:scale-95"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
    </div>
  );
}
