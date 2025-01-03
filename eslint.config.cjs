const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat();

module.exports = [
  js.configs.recommended,
  ...compat.config({
    extends: ['next', 'next/core-web-vitals'],
  }),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/web/pages'],
    },
    languageOptions: {
      parserOptions: {
        project: ['apps/*/tsconfig.json'],
      },
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '.next/**'],
  },
];
