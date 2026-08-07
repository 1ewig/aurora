import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.lemonsqueezy.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://*.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.insforge.app https://app.lemonsqueezy.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.insforge.app https://api.lemonsqueezy.com https://app.lemonsqueezy.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://*.vercel-scripts.com https://harmonics-paternity-blighted.ngrok-free.dev https://*.ngrok-free.dev;
  frame-src 'self' https://app.lemonsqueezy.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://app.lemonsqueezy.com;
  ${isProd ? "upgrade-insecure-requests;" : ""}
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

