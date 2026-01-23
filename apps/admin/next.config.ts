import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Admin uses SSR, not static export

  // Transpile workspace packages
  transpilePackages: ['@repo/ui', '@repo/shared', '@repo/database'],

  // Strict mode for better debugging
  reactStrictMode: true,

  // Server-side features enabled
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '10mb', // For file uploads
    },
  },
};

export default nextConfig;
