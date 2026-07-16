import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ['harmonics-paternity-blighted.ngrok-free.dev'],
  images: {
    qualities: [100, 85, 80, 75, 50],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.insforge.app',
        pathname: '/api/storage/buckets/**',
      },
    ],
  },
};

export default nextConfig;
