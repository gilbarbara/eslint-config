const baseRules = require('./rules/base');
const importRules = require('./rules/import');
const stylisticRules = require('./rules/stylistic');
const typescriptRules = require('./rules/typescript');
const unicornRules = require('./rules/unicorn');

module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  overrides: [
    {
      files: ['**/*.js?(x)'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
      },
    },
    {
      extends: ['plugin:import/typescript', 'plugin:@typescript-eslint/recommended'],
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      rules: typescriptRules,
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@babel', 'perfectionist', 'sort-destructure-keys', 'unicorn'],
  reportUnusedDisableDirectives: true,
  rules: {
    ...baseRules,
    ...importRules,
    ...stylisticRules,
    ...unicornRules,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jxs', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', './', './src'],
      },
      typescript: {},
    },
  },
};
