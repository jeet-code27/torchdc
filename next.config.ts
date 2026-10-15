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
    return [
      { source: "/shop-now", destination: "/shop", permanent: false },
      { source: "/shop-now/", destination: "/shop", permanent: false },
      { source: "/about-us", destination: "/about", permanent: false },
      { source: "/about-us/", destination: "/about", permanent: false },
      { source: "/cannabis-faq-dc", destination: "/faq", permanent: false },
      { source: "/cannabis-faq-dc/", destination: "/faq", permanent: false },
    ];
  },
};

export default nextConfig;
