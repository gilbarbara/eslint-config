const warnWithNaturalOrder = [
  'warn',
  {
    type: 'natural',
  },
];

module.exports = {
  'perfectionist/sort-array-includes': warnWithNaturalOrder,
  'perfectionist/sort-exports': warnWithNaturalOrder,
  'perfectionist/sort-heritage-clauses': warnWithNaturalOrder,
  'perfectionist/sort-imports': [
    'error',
    {
      customGroups: {
        value: {
          base: ['^src', '^test'],
          react: ['^react$', '^react-dom$', '^react.+'],
        },
      },
      groups: [
        'side-effect',
        ['builtin'],
        'react',
        { newlinesBetween: 'never' },
        'external',
        'type',
        'internal',
        'internal-type',
        'base',
        ['parent-type', 'sibling-type', 'index-type'],
        ['parent', 'sibling', 'index'],
        'style',
        'object',
        'unknown',
      ],
      internalPattern: ['^~', '^~/.*'],
      type: 'natural',
    },
  ],
  'perfectionist/sort-interfaces': warnWithNaturalOrder,
  'perfectionist/sort-intersection-types': warnWithNaturalOrder,
  'perfectionist/sort-maps': warnWithNaturalOrder,
  'perfectionist/sort-modules': warnWithNaturalOrder,
  'perfectionist/sort-named-exports': warnWithNaturalOrder,
  'perfectionist/sort-named-imports': warnWithNaturalOrder,
  'perfectionist/sort-object-types': warnWithNaturalOrder,
  'perfectionist/sort-objects': warnWithNaturalOrder,
  'perfectionist/sort-sets': warnWithNaturalOrder,
  'perfectionist/sort-union-types': warnWithNaturalOrder,
};
