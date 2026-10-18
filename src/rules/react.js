export default {
  '@eslint-react/dom-no-dangerously-set-innerhtml': 'warn',
  '@eslint-react/dom-no-dangerously-set-innerhtml-with-children': 'error',
  '@eslint-react/dom-no-find-dom-node': 'error',
  '@eslint-react/dom-no-hydrate': 'error',
  '@eslint-react/dom-no-missing-button-type': 'error',
  '@eslint-react/dom-no-missing-iframe-sandbox': 'error',
  '@eslint-react/dom-no-render': 'error',
  '@eslint-react/dom-no-render-return-value': 'error',
  '@eslint-react/dom-no-script-url': 'error',
  '@eslint-react/dom-no-string-style-prop': 'error',
  '@eslint-react/dom-no-unknown-property': 'error',
  '@eslint-react/dom-no-unsafe-iframe-sandbox': 'error',
  '@eslint-react/dom-no-unsafe-target-blank': 'error',
  '@eslint-react/dom-no-void-elements-with-children': 'error',
  '@eslint-react/jsx-no-children-prop': 'error',
  '@eslint-react/jsx-no-comment-textnodes': 'error',
  '@eslint-react/jsx-no-namespace': 'error',
  '@eslint-react/jsx-no-useless-fragment': ['error', { allowExpressions: false }],
  '@eslint-react/no-array-index-key': 'warn',
  '@eslint-react/no-component-will-mount': 'error',
  '@eslint-react/no-component-will-receive-props': 'error',
  '@eslint-react/no-component-will-update': 'error',
  '@eslint-react/no-nested-component-definitions': 'error',
  '@eslint-react/no-unstable-context-value': 'error',
  '@eslint-react/no-unstable-default-props': 'error',
  '@gilbarbara/destructuring-assignment': ['error', 'always'],
  '@gilbarbara/function-component-definition': [
    'error',
    {
      namedComponents: 'function-declaration',
    },
  ],
  '@gilbarbara/jsx-boolean-value': [
    'error',
    'never',
    {
      always: [],
    },
  ],
  '@gilbarbara/jsx-no-bind': [
    'error',
    {
      ignoreRefs: true,
      allowArrowFunctions: true,
      allowFunctions: false,
      allowBind: false,
      ignoreDOMComponents: true,
    },
  ],
  '@gilbarbara/jsx-no-duplicate-props': [
    'error',
    {
      ignoreCase: true,
    },
  ],
  '@gilbarbara/jsx-no-undef': 'error',
  '@stylistic/jsx-curly-brace-presence': [
    'error',
    {
      props: 'never',
      children: 'never',
    },
  ],
  '@stylistic/jsx-pascal-case': [
    'error',
    {
      allowAllCaps: true,
      ignore: [],
    },
  ],
  '@stylistic/jsx-self-closing-comp': 'error',
  'perfectionist/sort-jsx-props': [
    'warn',
    {
      type: 'natural',
      customGroups: [
        {
          groupName: 'reserved',
          elementNamePattern: '^(?:children|dangerouslySetInnerHTML|key|ref)$',
        },
      ],
      groups: ['reserved', 'unknown'],
    },
  ],
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
};
