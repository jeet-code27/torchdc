import type { Metadata } from "next";
import { StoreFaqSection } from "@/components/storefront/store-faq-section";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Torch Dispensary Washington DC",
  description:
    "Everything you need to know about shopping, ordering, and delivery from Torch Cannabis Dispensary in Downtown Washington DC.",
};

export default function FaqPage() {
  return (
    <div className="w-full bg-[#fafbfa] min-h-[70vh] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <StoreFaqSection />
      </div>
    </div>
  );
}
