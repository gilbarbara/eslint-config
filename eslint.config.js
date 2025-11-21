import base from './src/base.js';

export default [
  ...base,
  {
    ignores: ['node_modules/**', 'coverage/**', 'test/fixtures/**'],
  },
];
