import coreWebVitals from "eslint-config-next/core-web-vitals";
import playwright from "eslint-plugin-playwright";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".turbo/**",
      ".vercel/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...coreWebVitals,
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/e2e/**"],
  },
];

export default eslintConfig;
