module.exports = {
  root: true,
  extends: ["@repo/eslint-config/nextjs.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
