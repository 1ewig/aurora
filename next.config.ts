import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [100],
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
