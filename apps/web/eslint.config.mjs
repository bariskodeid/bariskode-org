import astro from 'eslint-plugin-astro';
import tsParser from '@typescript-eslint/parser';

export default [
  ...astro.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.astro'],
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
