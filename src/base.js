import babelParser from '@babel/eslint-parser';
import babelPlugin from '@babel/eslint-plugin';
import { fixupPluginRules } from '@eslint/compat';
import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import coreRules from './rules/core.js';
import importRules from './rules/import.js';
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
      'sort-destructure-keys': sortDestructureKeys,
      unicorn,
    },
    settings: {
      'import-x/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          moduleDirectory: ['node_modules', './', './src'],
        },
      },
    },
    rules: {
      ...coreRules,
      ...importRules,
      ...stylisticRules,
      ...unicornRules,
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
