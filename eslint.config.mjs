import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "backstop_data/html_report/**",
      "backstop_data/lab/**",
      "backstop_data/bitmaps_test/**",
    ],
  },
  {
    // Configs e engine scripts do BackstopJS são CommonJS por exigência da lib.
    files: ["backstop*.config.js", "vrt/**/*.js", "backstop_data/engine_scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
