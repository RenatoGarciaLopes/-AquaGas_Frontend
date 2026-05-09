/** @type {import("eslint").Linter.Config} */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ["perfectionist", "unused-imports"],
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "no-alert": 0,
    camelcase: 0,
    "no-console": 0,
    "no-unused-vars": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "no-restricted-exports": 0,
    "react/no-children-prop": 0,
    "react/react-in-jsx-scope": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "react/no-array-index-key": 0,
    "no-promise-executor-return": 0,
    "react/require-default-props": 0,
    "react/jsx-props-no-spreading": 0,
    "import/prefer-default-export": 0,
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
    "react/function-component-definition": 0,
    "@typescript-eslint/naming-convention": 0,
    "jsx-a11y/control-has-associated-label": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "react/prop-types": "off",
    "react/jsx-no-useless-fragment": [
      1,
      {
        allowExpressions: true,
      },
    ],
    "prefer-destructuring": [
      1,
      {
        object: true,
        array: false,
      },
    ],
    "react/no-unstable-nested-components": [
      1,
      {
        allowAsProps: true,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        args: "none",
      },
    ],
    "react/jsx-no-duplicate-props": [
      1,
      {
        ignoreCase: false,
      },
    ],
    "unused-imports/no-unused-imports": 1,
    "unused-imports/no-unused-vars": [
      0,
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "perfectionist/sort-named-imports": [
      1,
      {
        order: "asc",
        type: "line-length",
      },
    ],
    "perfectionist/sort-named-exports": [
      1,
      {
        order: "asc",
        type: "line-length",
      },
    ],
    "perfectionist/sort-exports": [
      1,
      {
        order: "asc",
        type: "line-length",
      },
    ],
    "perfectionist/sort-imports": [
      1,
      {
        order: "asc",
        type: "line-length",
        newlinesBetween: "always",
        internalPattern: ["src/**", "@/**"],
        groups: [
          ["builtin", "external"],
          "custom-mui",
          "custom-app",
          "custom-hooks",
          "custom-utils",
          "internal",
          "custom-features",
          "custom-components",
          "custom-sections",
          "custom-types",
          ["parent", "sibling", "index"],
          "object",
          "unknown",
        ],
        customGroups: {
          value: {
            "custom-mui": "@mui/**",
            "custom-app": "**/src/app/**",
            "custom-hooks": "**/hooks/**",
            "custom-utils": "**/shared/lib/**",
            "custom-features": "**/features/**",
            "custom-components": "**/components/**",
            "custom-sections": "**/sections/**",
            "custom-types": "**/types/**",
          },
        },
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        packageDir: ["."],
      },
    ],
    "react/jsx-filename-extension": [
      "error",
      {
        allow: "as-needed",
        extensions: [".tsx", ".jsx"],
      },
    ],
  },
  overrides: [
    {
      files: [
        "*.mjs",
        "*.cjs",
        "*.js",
        "aquagas.eslintrc.cjs",
        "eslint.config.mjs",
        "postcss.config.mjs",
      ],
      parserOptions: {
        project: false,
      },
    },
    {
      files: ["*.config.*", "*.mjs", "*.cjs", "scripts/**"],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        "import/no-extraneous-dependencies": "off",
      },
    },
  ],
};
