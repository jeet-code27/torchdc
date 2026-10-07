import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Mail, Clock, ShieldCheck } from "lucide-react";

export function StoreFooter() {
  const shopLinks = [
    { name: "Flowers", href: "/category/flowers" },
    { name: "Pre-rolls", href: "/category/pre-rolls" },
    { name: "Disposables", href: "/category/disposables" },
    { name: "Concentrates", href: "/category/concentrates" },
    { name: "Edibles", href: "/category/edibles" },
    { name: "Mushrooms", href: "/category/mushrooms" },
  ];

  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Terms and Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  const deliveryAreas = [
    { name: "Downtown", href: "/delivery-areas/downtown" },
    { name: "Adams Morgan", href: "/delivery-areas/adams-morgan" },
    { name: "Columbia Heights", href: "/delivery-areas/columbia-heights" },
    { name: "Brookland", href: "/delivery-areas/brookland" },
    { name: "Shaw", href: "/delivery-areas/shaw" },
    { name: "Logan Circle", href: "/delivery-areas/logan-circle" },
    { name: "Capitol Hill", href: "/delivery-areas/capitol-hill" },
    { name: "Navy Yard", href: "/delivery-areas/navy-yard" },
    { name: "Dupont Circle", href: "/delivery-areas/dupont-circle" },
    { name: "Petworth", href: "/delivery-areas/petworth" },
    { name: "U Street", href: "/delivery-areas/u-street" },
    { name: "Georgetown", href: "/delivery-areas/georgetown" },
    { name: "H Street", href: "/delivery-areas/h-street" },
  ];

  return (
    <footer className="bg-[#121813] text-gray-300 pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-gray-800/80">
          {/* ================= COL 1: BRAND & CONTACT (4 cols) ================= */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-2xl shadow-xs">
              <Image
                src="/images/torch-logo.svg"
                alt="Torch Logo"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>

            <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
              Order online or by phone for free delivery or curbside pickup.
            </p>

            <div className="space-y-2.5 text-xs sm:text-[13px] text-gray-400 pt-1">
              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#557754] shrink-0" />
                <a
                  href="tel:+12024681966"
                  className="text-white hover:text-emerald-400 font-bold transition-colors"
                >
                  (202) 468-1966
                </a>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#557754] shrink-0 mt-0.5" />
                <a
                  href="https://maps.google.com/?q=1025+F+St+NW,+Washington,+DC+20004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  1025 F St NW, Washington, DC 20004
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#557754] shrink-0" />
                <a
                  href="mailto:info@torchdc.co"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@torchdc.co
                </a>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#557754] shrink-0" />
                <span className="text-gray-300">Open daily, 7AM to 11PM</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>For adults 21+ only · DC Initiative 71</span>
            </div>
          </div>

          {/* ================= COL 2: SHOP (2 cols) ================= */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {shopLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COL 3: COMPANY (3 cols) ================= */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= COL 4: DELIVERY AREAS (3 cols) ================= */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              Delivery Areas
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs sm:text-sm">
              {deliveryAreas.map((area) => (
                <Link
                  key={area.name}
                  href={area.href}
                  className="text-gray-400 hover:text-white transition-colors truncate"
                  title={`Cannabis delivery to ${area.name}, DC`}
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center md:text-left leading-relaxed">
            © 2026 Torch · 1025 F St NW, Washington, DC 20004 · (202) 468-1966 · For adults 21+ only.
          </p>
          <p className="text-center md:text-right shrink-0 text-[11px] text-gray-600">
            Initiative 71 Compliant DC Dispensary
          </p>
        </div>
      </div>
    </footer>
  );
}
