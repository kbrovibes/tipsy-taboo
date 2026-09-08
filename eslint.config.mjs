import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // hydrating from localStorage after mount is the whole point of those effects
      "react-hooks/set-state-in-effect": "off",
      // tapping the logo is a deliberate full reload back to a clean start
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);

export default eslintConfig;
