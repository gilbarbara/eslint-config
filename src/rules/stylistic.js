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
      customGroups: [
        { groupName: 'components', elementNamePattern: COMPONENTS.map(c => `^~/${c}/`) },
        { groupName: 'legacy', elementNamePattern: ['^src', '^test'] },
        { groupName: 'react', elementNamePattern: ['^react$', '^react-dom$', '^react-.+'] },
        { groupName: 'root', elementNamePattern: '^~$' },
        { groupName: 'types', elementNamePattern: '^~/types' },
      ],
      groups: [
        'side-effect',
        'builtin',
        'react',
        { newlinesBetween: 0 },
        'external',
        'root',
        'internal',
        'components',
        'legacy',
        'types',
        'parent',
        'sibling',
        'index',
        'style',
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
