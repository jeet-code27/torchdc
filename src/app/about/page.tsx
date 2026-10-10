import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, Clock, Sparkles, MapPin, Phone, ArrowRight } from "lucide-react";
import { StoreStatusBar } from "@/components/storefront/store-statusbar";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";

export const metadata: Metadata = {
  title: "About Us | Torch Dispensary Washington DC",
  description:
    "Learn about Torch Dispensary: Washington D.C.'s premier Initiative 71 compliant gifting service offering top-shelf flower, pre-rolls, cartridges, and fast delivery.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfa] text-neutral-900 selection:bg-[#5A805B]/20 selection:text-[#5A805B]">
      <StoreStatusBar />
      <StoreNavbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#5A805B]/15 text-[#5A805B]">
            About Torch DC
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Washington D.C.&apos;s Premier Cannabis Dispensary & Delivery
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Committed to providing safe, discreet, and reliable gifting of premium California & Pacific Northwest cannabis directly to adults aged 21 and older across the District.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#5A805B]/10 text-[#5A805B] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Initiative 71 Compliant</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We operate strictly under D.C. Official Code § 48-904.01. Valid 21+ government photo ID is verified for all customers.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">35-45 Min DC Delivery</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Real-time dispatchers and professional couriers deliver right to your door or curbside across Dupont Circle, Georgetown, Capitol Hill, and more.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Curated Exotic Quality</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              From fresh harvest Midshelf to Private Reserve indoor flower, lab-tested disposables, solventless rosin, and artisan edibles.
            </p>
          </div>
        </div>

        {/* Store Location & Hours Box */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Open Daily 7:00 AM – 11:00 PM</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900">1025 F St NW, Washington, DC 20004</h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Curbside pickup available daily. Call or text our dispatch team anytime for updates.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+12024681966"
              className="px-5 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#5A805B]" />
              <span>(202) 468-1966</span>
            </a>
            <Link
              href="/shop"
              className="px-6 py-3 rounded-full bg-[#5A805B] hover:bg-[#4a6b4b] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
