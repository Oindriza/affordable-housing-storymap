export default {
  extends: ["eslint:recommended", "google"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    browser: true,
  },
  ignorePatterns: ["examples/**/*.js"],
  globals: {
    L: "readonly",
  },
  rules: {
    "object-curly-spacing": "off",
    "max-len": "off",
  },
};
