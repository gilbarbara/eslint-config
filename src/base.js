const coreRules = require('./rules/core');
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
  extends: ['plugin:prettier/recommended'],
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
  plugins: ['@babel', 'import', 'perfectionist', 'sort-destructure-keys', 'unicorn'],
  reportUnusedDisableDirectives: true,
  rules: {
    ...coreRules,
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
