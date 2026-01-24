module.exports = {
  root: true,
  extends: ["@repo/eslint-config/nextjs.js"],
  parserOptions: {
    project: ["./tsconfig.json", "../../packages/shared/tsconfig.json", "../../packages/database/tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["e2e/**", "playwright.config.ts"],
};
