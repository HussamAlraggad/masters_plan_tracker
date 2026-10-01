/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'zustand'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hu.edu.jo',
      },
    ],
  },
};

module.exports = nextConfig;