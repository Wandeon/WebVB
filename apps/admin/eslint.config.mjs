import nextjsConfig from '@repo/eslint-config/nextjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextjsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['e2e/**', 'playwright.config.ts'],
  },
];
