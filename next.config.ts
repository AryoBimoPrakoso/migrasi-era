import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Enable gzip compression
  compress: true,

  // Enable React strict mode for better debugging
  reactStrictMode: true,

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Reduce device sizes for smaller bundles
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default nextConfig;
