import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-visitor pages
      disallow: ["/admin", "/api/", "/cart", "/checkout", "/account", "/login", "/order-success", "/track-order"],
    },
    sitemap: "https://torchdc.co/sitemap.xml",
  };
}
