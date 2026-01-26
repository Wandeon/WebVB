import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Transpile workspace packages
  transpilePackages: ['@repo/ui', '@repo/shared', '@repo/database'],

  // Strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;
