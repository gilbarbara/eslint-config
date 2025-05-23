module.exports = {
  curly: ['error', 'all'],
  'global-require': 'off',
  'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
  'newline-per-chained-call': ['warn', { ignoreChainWithDepth: 5 }],
  'no-else-return': ['error', { allowElseIf: true }],
  'no-param-reassign': [
    'error',
    {
      props: true,
      ignorePropertyModificationsFor: [
        'acc', // for reduce accumulators
        'accumulator', // for reduce accumulators
        'e', // for events
        'event', // for events / AWS Lambdas
        'el', // for HTMLElements
        'element', // for HTMLElements
        'ctx', // for Koa routing
        'context', // for Koa routing
        'draft', // for immer
        'req', // for Express requests
        'request', // for Express requests
        'res', // for Express responses
        'response', // for Express responses
      ],
    },
  ],
  'no-plusplus': 'off',
  'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
  'no-restricted-exports': ['error', { restrictDefaultExports: { defaultFrom: false } }],
  'padding-line-between-statements': [
    'warn',
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    { blankLine: 'always', prev: 'block-like', next: '*' },
    { blankLine: 'always', prev: '*', next: 'block-like' },
    { blankLine: 'never', prev: 'case', next: 'block-like' },
    { blankLine: 'always', prev: '*', next: 'return' },
  ],
  'sort-destructure-keys/sort-destructure-keys': ['error', { caseSensitive: false }],
};
