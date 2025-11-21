import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import jsxA11yRules from './rules/jsx-a11y.js';
import reactRules from './rules/react.js';

export default [
  {
    plugins: {
      react,
      'react-compiler': reactCompiler,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
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
      'react-compiler/react-compiler': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // JS-specific React rules
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
    },
    rules: {
      'react/prop-types': 'warn',
    },
  },

  // TS-specific React rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'react/default-props-match-prop-types': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/no-unused-prop-types': 'off',
    },
  },
];
