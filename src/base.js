import babelParser from '@babel/eslint-parser';
import babelPlugin from '@babel/eslint-plugin';
import { fixupPluginRules } from '@eslint/compat';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import regexp from 'eslint-plugin-regexp';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import coreRules from './rules/core.js';
import importRules from './rules/import.js';
import promiseRules from './rules/promise.js';
import regexpRules from './rules/regexp.js';
import stylisticRules from './rules/stylistic.js';
import typescriptRules from './rules/typescript.js';
import unicornRules from './rules/unicorn.js';

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.commonjs,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      '@babel': fixupPluginRules(babelPlugin),
      'import-x': importX,
      perfectionist,
      promise,
      regexp,
      'sort-destructure-keys': sortDestructureKeys,
      unicorn,
      'unused-imports': unusedImports,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', './', './src'],
        },
        typescript: true,
      },
    },
    rules: {
      ...coreRules,
      ...importRules,
      ...promiseRules,
      ...regexpRules,
      ...stylisticRules,
      ...unicornRules,
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // JavaScript files with Babel parser
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
      },
    },
  },

  // TypeScript files
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: typescriptRules,
  },

  // Prettier (must be last)
  prettier,
];
