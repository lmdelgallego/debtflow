import { globalIgnores } from "eslint/config";
import baseConfig from "@debtflow/config/eslint/base";

export default [
  ...baseConfig,
  globalIgnores([
    "babel.config.js",
    "eslint.config.mjs",
    "metro.config.js",
    "tailwind.config.js"
  ])
];
