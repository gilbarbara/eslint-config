import n from 'eslint-plugin-n';

import nodeRules from './rules/node.js';

export default [
  {
    plugins: {
      n,
    },
    rules: nodeRules,
  },
];
