import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  // Disallow unsafe numeric operations outside number.utils.js
  {
    files: ["src/**/*.{js,jsx}"],
    ignores: ["src/utils/number.utils.js"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "CallExpression[callee.name='parseFloat']",
          message:
            "Use sanitizeNumber() from utils/number.utils.js instead of parseFloat().",
        },
        {
          selector: "CallExpression[callee.property.name='toFixed']",
          message:
            "Use formatAmount() or formatRate() from utils/number.utils.js instead of .toFixed().",
        },
      ],
    },
  },
]);
