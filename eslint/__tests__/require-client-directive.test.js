const { RuleTester } = require('eslint');
const rule = require('../plugins/require-client-directive');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

// Mock the filename to look like a Next.js page
ruleTester.run('require-client-directive', rule, {
  valid: [
    {
      filename: 'app/dashboard/page.tsx',
      code: `'use client';
             import { useAuth } from '@/hooks/use-auth';
             export default function Page() {
               const auth = useAuth();
               return <div>Test</div>;
             }`,
    },
    {
      filename: 'app/page.tsx',
      code: `export default function Home() {
               return <div>Home</div>;
             }`,
    },
  ],
  invalid: [
    {
      filename: 'app/profile/page.tsx',
      code: `import { useAuth } from '@/hooks/use-auth';
             export default function Profile() {
               const auth = useAuth();
               return <div>Profile</div>;
             }`,
      errors: [{ messageId: 'missingUseClient' }],
      output: `'use client';

import { useAuth } from '@/hooks/use-auth';
             export default function Profile() {
               const auth = useAuth();
               return <div>Profile</div>;
             }`,
    },
  ],
});
