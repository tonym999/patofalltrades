import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Device sizes for responsive srcset generation
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for smaller images (icons, thumbnails)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Formats to generate (webp is more efficient, avif even more so)
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
};

export default nextConfig;
