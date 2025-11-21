const warnWithNaturalOrder = [
  'warn',
  {
    type: 'natural',
  },
];

const COMPONENTS = ['components', 'containers', 'pages', 'routes'];

export default {
  'perfectionist/sort-array-includes': warnWithNaturalOrder,
  'perfectionist/sort-exports': warnWithNaturalOrder,
  'perfectionist/sort-imports': [
    'error',
    {
      customGroups: {
        value: {
          components: COMPONENTS.map(c => `^~/${c}/`),
          legacy: ['^src', '^test'],
          react: ['^react$', '^react-dom$', '^react.+'],
          root: ['^~$'],
          types: ['^~/types'],
        },
      },
      groups: [
        'side-effect',
        ['builtin'],
        'react',
        { newlinesBetween: 'never' },
        'external',
        'root',
        'internal',
        'components',
        'legacy',
        'types',
        'parent',
        'index',
        'sibling',
        'style',
        'object',
        'unknown',
      ],
      internalPattern: [`^~/(?!(${COMPONENTS.join('|')}|types))`],
      type: 'natural',
    },
  ],
  'perfectionist/sort-interfaces': warnWithNaturalOrder,
  'perfectionist/sort-maps': warnWithNaturalOrder,
  'perfectionist/sort-modules': [
    'warn',
    {
      groups: [
        'declare-enum',
        'export-enum',
        'enum',
        'declare-type',
        'declare-interface',
        'type',
        'interface',
        'export-type',
        'export-interface',
        'declare-class',
        'class',
        'export-class',
        'declare-function',
        'function',
        'export-function',
      ],
    },
  ],
  'perfectionist/sort-named-exports': warnWithNaturalOrder,
  'perfectionist/sort-named-imports': warnWithNaturalOrder,
  'perfectionist/sort-object-types': warnWithNaturalOrder,
  'perfectionist/sort-sets': warnWithNaturalOrder,
};
