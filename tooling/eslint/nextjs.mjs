import nextConfig from 'eslint-config-next';
import baseConfig from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...nextConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
