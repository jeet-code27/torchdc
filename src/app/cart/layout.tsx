import type { Metadata } from "next";

// The cart page is a client component, so its metadata lives here (client site cart.html)
export const metadata: Metadata = {
  title: "Your Cart | Torch Cannabis Delivery",
  description: "Review your order and check out. Free delivery across Washington, DC. Pay cash on delivery.",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
