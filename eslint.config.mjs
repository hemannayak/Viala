import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Import configurations
import nextConfigCore from "eslint-config-next/core-web-vitals";
import nextConfigTs from "eslint-config-next/typescript";

const eslintConfig = [
  // Flat config next rules
  ...nextConfigCore,
  ...nextConfigTs,
  // Custom rules
  {
    files: ['**/app/**/page.{js,jsx,ts,tsx}'],
    plugins: {
      'require-client-directive': {
        rules: {
          'enforce': require(path.join(__dirname, 'eslint/plugins/require-client-directive.cjs'))
        }
      }
    },
    rules: {
      'require-client-directive/enforce': 'error'
    }
  },
  // Override default ignores
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  }
];

export default eslintConfig;

