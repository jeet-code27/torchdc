import type { Metadata } from "next";
import { DealsView } from "@/components/storefront/deals-view";

export const metadata: Metadata = {
  title: "Cannabis Deals in DC | Bundle Deal, Stack & Save | Torch",
  description:
    "Bulk flower deals on Midshelf, Topshelf and Exotic: Bundle Deals on half ounces, Stack & Save ounces and the Half-Pound Haul. Free DC delivery.",
};

export const revalidate = 60;

export default function DealsPage() {
  return <DealsView />;
}
