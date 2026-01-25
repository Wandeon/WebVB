import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'framer-motion': resolve(__dirname, 'test-helpers/framer-motion.tsx'),
      '@radix-ui/react-accordion': resolve(__dirname, 'test-helpers/radix-accordion.tsx'),
      'isomorphic-dompurify': resolve(__dirname, 'test-helpers/isomorphic-dompurify.ts'),
      'next/link': resolve(__dirname, 'test-helpers/next-link.tsx'),
      'next/navigation': resolve(__dirname, 'test-helpers/next-navigation.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
  },
});
