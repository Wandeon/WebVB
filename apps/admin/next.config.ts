import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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

export default withSentryConfig(nextConfig, {
  // Suppress logs unless in CI
  silent: !process.env.CI,

  // Disable source map upload until Sentry project is configured
  sourcemaps: {
    disable: !process.env.SENTRY_DSN,
  },
});
