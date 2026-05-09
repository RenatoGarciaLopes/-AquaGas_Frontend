import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

/** Regras `next/core-web-vitals` sem puxar `eslint-config-next` completo (evita colisão de plugin com Airbnb). */
const nextCoreWebVitalsRules = {
  ...nextPlugin.configs["core-web-vitals"].rules,
};

/**
 * @see ARQUITETURA_FRONTEND.md §15.6; §316
 * `eslint-config-airbnb-typescript` não é usado: incompatível com `@typescript-eslint` v8 (Next 16).
 * TypeScript: `eslint-config-next/typescript` (typescript-eslint recomendado).
 */
export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
  ...compat.extends("./aquagas.eslintrc.cjs"),
  {
    name: "next/core-web-vitals-plugin-only",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: nextCoreWebVitalsRules,
  },
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "react-hooks/exhaustive-deps": "error",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
        },
      ],
    },
  },
]);
