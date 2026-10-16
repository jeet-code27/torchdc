import type { Metadata } from "next";
import { FaqPageView } from "@/components/storefront/faq-page-view";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Torch Dispensary Washington DC",
  description:
    "Everything you need to know about shopping, ordering, and delivery from Torch Cannabis Dispensary in Downtown Washington DC.",
};

export default function FaqPage() {
  return <FaqPageView />;
}
