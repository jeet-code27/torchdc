import type { Metadata } from "next";
import { DealsView } from "@/components/storefront/deals-view";

export const metadata: Metadata = {
  title: "Today's Cannabis Deals & Specials | Torch Dispensary Washington DC",
  description:
    "Check out today's exclusive specials at Torch Dispensary: Wake & Bake morning discounts, ounce bundles, and daily dispensary deals with fast DC delivery.",
};

export const revalidate = 60;

export default function DealsPage() {
  return <DealsView />;
}
