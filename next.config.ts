import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "torchdc.co",
      },
    ],
  },
  async redirects() {
    // Old WordPress URLs on torchdc.co -> new pages (301 so search rankings carry over).
    // Admin-managed redirects (Admin -> SEO -> Redirects) are applied in src/proxy.ts.
    const wp: [string, string][] = [
      // Pages
      ["/shop-now", "/shop"],
      ["/about-us", "/about"],
      ["/cannabis-faq-dc", "/faq"],
      ["/old-how-to-order", "/faq"],
      ["/evercompare", "/shop"],
      ["/coming-soon", "/"],
      ["/cannabis-delivery-dc", "/"],
      ["/torch-strain", "/flowers"],
      ["/buy-cannabis-in-dc-as-a-tourist-torch", "/faq"],
      ["/affordable-cannabis-in-downtown-dc-weed-deals-duplicate-13908", "/affordable-cannabis-in-downtown-dc-weed-deals"],
      // Product categories
      ["/product-category/midshelf", "/flowers?tier=Midshelf"],
      ["/product-category/topshelf", "/flowers?tier=Topshelf"],
      ["/product-category/private-reserve", "/flowers?tier=Exotic"],
      ["/product-category/premium-flower", "/flowers"],
      ["/product-category/premium-flower/:sub", "/flowers"],
      ["/product-category/flowers", "/flowers"],
      ["/product-category/disposables/:sub", "/shop?category=disposables"],
      ["/product-category/:cat", "/shop?category=:cat"],
      // Blog categories
      ["/category/:slug", "/blog"],
      // Products whose WordPress slug no longer matches
      ["/product/tangie-strain", "/product/tangie-sativa"],
      ["/product/og-kush-strain", "/product/og-kush-hybrid"],
      ["/product/slurricane-copy", "/product/slurricane-hybrid"],
      ["/product/death-star-strain", "/product/death-star-indica"],
      ["/product/nevilles-haze-3", "/product/nevilles-haze-sativa"],
      ["/product/animal-mints-strain", "/product/animal-mints-hybrid"],
      ["/product/acapulco-gold-seeds", "/product/acapulco-gold-sativa"],
      ["/product/super-silver-haze-strain", "/product/super-silver-haze-sativa"],
      ["/product/9-pound-hammer-strain", "/product/9-pound-hammer-indica"],
    ];
    return wp.map(([source, destination]) => ({ source, destination, permanent: true }));
  },

};

export default nextConfig;
