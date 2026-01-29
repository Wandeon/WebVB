import createMDX from '@next/mdx';
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

  // Enable MDX pages
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

// MDX configuration is in mdx.config.mjs for Turbopack compatibility
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
