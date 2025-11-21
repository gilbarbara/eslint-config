import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import jsxA11yRules from './rules/jsx-a11y.js';
import reactRules from './rules/react.js';

export default [
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
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
