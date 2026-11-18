import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import security from 'eslint-plugin-security';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      security: security,
    },
    rules: {
      // Accessibility
      ...jsxA11y.configs.recommended.rules,

      // Security
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-eval-with-expression': 'error',

      // Code quality
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      complexity: ['error', { max: 10 }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    },
  },
  // Test files: relax max-lines-per-function and security/detect-object-injection
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      'security/detect-object-injection': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // Page / component files: raise max-lines-per-function limit
  {
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'scripts/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
