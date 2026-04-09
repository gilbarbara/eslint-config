import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';

import jsxA11yRules from './rules/jsx-a11y.js';
import reactRules from './rules/react.js';

export default [
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh.plugin,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
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

  // JS-specific React rules (Babel JSX parsing)
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },
  },
];
