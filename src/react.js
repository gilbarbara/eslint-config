import eslintReact from '@eslint-react/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';

import jsxA11yRules from './rules/jsx-a11y.js';
import reactKit from './rules/react-kit.js';
import reactRules from './rules/react.js';

export default [
  {
    plugins: {
      '@eslint-react': eslintReact,
      '@gilbarbara': reactKit,
      // @stylistic and perfectionist are also registered in base; repeated so this config works
      // on its own.
      '@stylistic': stylistic,
      perfectionist,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh.plugin,
      'jsx-a11y-x': jsxA11y,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactRules,
      ...jsxA11yRules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // ESLint only lints .js, .mjs and .cjs unless a config names other extensions; base does too,
  // repeated so this config works on its own.
  {
    files: ['**/*.jsx'],
  },
];
