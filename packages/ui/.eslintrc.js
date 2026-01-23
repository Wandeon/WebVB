module.exports = {
  root: true,
  extends: ["@repo/eslint-config/library.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
