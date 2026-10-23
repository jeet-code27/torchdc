import type { Metadata } from "next";
import { AboutStorefrontView } from "@/components/storefront/about-storefront-view";

export const metadata: Metadata = {
  title: "About Torch | Cannabis Delivery in Washington, DC",
  description:
    "Torch is a Downtown DC cannabis delivery service with hand-picked flower, real expertise and free, discreet delivery across the District.",
};

export default function AboutPage() {
  return <AboutStorefrontView />;
}
