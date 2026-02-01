import nextjsConfig from '@repo/eslint-config/nextjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextjsConfig,
  {
    ignores: ['public/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
