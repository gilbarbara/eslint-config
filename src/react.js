const jsxA11yRules = require('./rules/jsx-a11y');
const reactRules = require('./rules/react');

module.exports = {
  plugins: ['react', 'jsx-a11y', 'react-hooks'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.js?(x)'],
      parserOptions: {
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
      rules: {
        'react/prop-types': 'warn',
      },
    },
    {
      files: ['**/*.ts?(x)'],
      rules: {
        'react/default-props-match-prop-types': 'off',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/no-unused-prop-types': 'off',
      },
    },
  ],
  rules: {
    ...reactRules,
    ...jsxA11yRules,
  },
};
