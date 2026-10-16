import type { Metadata } from "next";
import { AboutStorefrontView } from "@/components/storefront/about-storefront-view";

export const metadata: Metadata = {
  title: "About Us | Torch Dispensary Washington DC",
  description:
    "DC's cannabis, done right. Hand-picked products, real expertise and fast, discreet delivery from Downtown DC. 21+ only.",
};

export default function AboutPage() {
  return <AboutStorefrontView />;
}
