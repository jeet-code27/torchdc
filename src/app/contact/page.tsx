import type { Metadata } from "next";
import { ContactView } from "@/components/storefront/contact-view";

export const metadata: Metadata = {
  title: "Contact Torch | Cannabis Delivery in Washington, DC",
  description:
    "Call, text or email Torch. 1000 G St NW, Washington, DC 20001. Open 7 days a week, 7AM to 11PM.",
  alternates: {
    canonical: "/contact-us",
  },
};

export default function ContactPage() {
  return <ContactView />;
}
