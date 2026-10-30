import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import "./client-site.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/context/cart-context";
import { StoreAgeGate } from "@/components/storefront/store-age-gate";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { pageKeyInlineScript } from "@/lib/page-key";
import { getSeoSettings } from "@/lib/seo-settings";

import { SessionProvider } from "@/components/auth/session-provider";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const baseMetadata: Metadata = {
  // Production domain: canonical and Open Graph URLs resolve against it
  metadataBase: new URL("https://torchdc.co"),
  // Defaults = homepage (client site index.html); other pages set their own
  title: "Weed Delivery in Washington, DC | Torch Cannabis Delivery",
  description:
    "Torch delivers flower, pre-rolls, vapes, concentrates and edibles across Washington, DC. Free delivery, pay cash on delivery. 21+ only.",
  // Tab, home screen and app icons from the client site (Oct 22)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "96x96" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "Torch Cannabis Delivery",
    type: "website",
    locale: "en_US",
    images: [{ url: "/assets/img/og.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/img/og.jpg"],
  },
};

// Search Console / Bing verification and the share image come from Admin › SEO
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const other: Record<string, string> = {};
  if (seo.bingVerification) other["msvalidate.01"] = seo.bingVerification;
  const image = seo.defaultShareImage;
  return {
    ...baseMetadata,
    ...(seo.googleVerification || seo.bingVerification
      ? { verification: { ...(seo.googleVerification ? { google: seo.googleVerification } : {}), other } }
      : {}),
    ...(image
      ? {
          openGraph: { ...baseMetadata.openGraph, images: [{ url: image }] },
          twitter: { ...baseMetadata.twitter, images: [image] },
        }
      : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#5A805B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jost.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${jost.className} min-h-screen bg-background text-foreground antialiased font-sans`}
        suppressHydrationWarning
      >
        {/* Sets body[data-page] before first paint (page-specific CSS from the client site) */}
        <script dangerouslySetInnerHTML={{ __html: pageKeyInlineScript() }} />
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
              <StorefrontShell>{children}</StorefrontShell>
            </CartProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
