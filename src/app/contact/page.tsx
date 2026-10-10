import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Clock, Mail, MessageSquare, ArrowRight } from "lucide-react";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";

export const metadata: Metadata = {
  title: "Contact Us | Torch Dispensary Washington DC",
  description:
    "Contact Torch Dispensary in Washington D.C. Call or text (202) 468-1966. Curbside pickup at 1025 F St NW. Open daily 7AM - 11PM.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      <StoreStatusBar />
      <StoreNavbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#5A805B]/15 text-[#5A805B]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            We&apos;re Here to Help
          </h1>
          <p className="text-sm text-neutral-600">
            Have a question about your delivery, DC gifting laws, or product recommendations? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phone */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Call or Text</h3>
              <p className="text-xs text-neutral-500 mt-1">Live dispatchers ready daily</p>
            </div>
            <a
              href="tel:+12024681966"
              className="inline-block text-base font-extrabold text-[#5A805B] hover:underline"
            >
              (202) 468-1966
            </a>
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Pickup Location</h3>
              <p className="text-xs text-neutral-500 mt-1">Curbside & in-store pickup</p>
            </div>
            <a
              href="https://maps.google.com/?q=1025+F+St+NW,+Washington,+DC+20004"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-neutral-800 hover:text-[#5A805B] hover:underline"
            >
              1025 F St NW, Washington, DC 20004
            </a>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Store Hours</h3>
              <p className="text-xs text-neutral-500 mt-1">365 days a year</p>
            </div>
            <p className="text-sm font-extrabold text-neutral-800">
              Open Daily 7:00 AM – 11:00 PM
            </p>
          </div>
        </div>

        {/* Quick Help Banner */}
        <div className="rounded-3xl bg-[#5A805B]/10 border border-[#5A805B]/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-neutral-900">Ready to place your order?</h3>
            <p className="text-xs text-neutral-600">
              Average delivery time across DC is 35 to 45 minutes with cash on delivery.
            </p>
          </div>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs shrink-0"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
