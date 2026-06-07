import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '4eu5wk8i.us-east.insforge.app',
        pathname: '/api/storage/buckets/**',
      },
    ],
  },
};

export default nextConfig;
