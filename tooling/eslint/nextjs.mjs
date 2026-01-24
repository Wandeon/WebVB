import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from './base.mjs';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
