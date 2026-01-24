import libraryConfig from '@repo/eslint-config/library';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
