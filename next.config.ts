import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2k6fvhyk5xgx.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: '*.cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
      },
    ],
    // Allow local images and API routes with query strings
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/api/images/**',
      },
      {
        pathname: '/logo*.png',
      },
      {
        pathname: '/*.png',
      },
    ],
    // Configure image qualities to suppress warnings
    qualities: [75, 85],
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true
  },
};

export default nextConfig;
