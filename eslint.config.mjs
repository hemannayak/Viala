import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Custom rules
  {
    files: ['**/app/**/page.{js,jsx,ts,tsx}'],
    plugins: {
      'require-client-directive': {
        rules: {
          'enforce': require(path.join(__dirname, 'eslint/plugins/require-client-directive.js'))
        }
      }
    },
    rules: {
      'require-client-directive/enforce': 'error'
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
