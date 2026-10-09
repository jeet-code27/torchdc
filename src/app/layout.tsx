import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { StoreAgeGate } from "@/components/storefront/store-age-gate";

import { SessionProvider } from "@/components/auth/session-provider";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TORCH | Premium Dispensary & Delivery in Washington DC",
  description: "Torch - Washington DC Premium Weed Dispensary & Same-Day Delivery. 21+ only.",
  icons: {
    icon: "/images/torch-logo.svg",
    shortcut: "/images/torch-logo.svg",
    apple: "/images/torch-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jost.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="torch-theme-v2"
            disableTransitionOnChange
          >
            <CartProvider>
              {/* Immediate 21+ Age Gate Modal */}
              <StoreAgeGate />
              {children}
            </CartProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
