export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        L: "readonly", // allow Leaflet global
      },
    },
    rules: {
      // Optional: you can add some basic style rules
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
