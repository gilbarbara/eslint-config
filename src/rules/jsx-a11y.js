export default {
  'jsx-a11y-x/alt-text': [
    'error',
    {
      elements: ['img', 'object', 'area', 'input[type="image"]'],
      img: [],
      object: [],
      area: [],
      'input[type="image"]': [],
    },
  ],
  'jsx-a11y-x/anchor-has-content': ['error', { components: [] }],
  'jsx-a11y-x/anchor-is-valid': [
    'error',
    {
      components: ['Link'],
      specialLink: ['to'],
      aspects: ['noHref', 'invalidHref', 'preferButton'],
    },
  ],
  'jsx-a11y-x/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y-x/aria-props': 'error',
  'jsx-a11y-x/aria-proptypes': 'error',
  'jsx-a11y-x/aria-role': ['error', { ignoreNonDOM: false }],
  'jsx-a11y-x/aria-unsupported-elements': 'error',
  'jsx-a11y-x/autocomplete-valid': 'warn',
  'jsx-a11y-x/click-events-have-key-events': 'error',
  'jsx-a11y-x/control-has-associated-label': [
    'warn',
    {
      labelAttributes: ['label'],
      controlComponents: [],
      ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
      ignoreRoles: [
        'grid',
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'row',
        'tablist',
        'toolbar',
        'tree',
        'treegrid',
      ],
      depth: 5,
    },
  ],
  'jsx-a11y-x/heading-has-content': ['error', { components: [''] }],
  'jsx-a11y-x/html-has-lang': 'error',
  'jsx-a11y-x/iframe-has-title': 'error',
  'jsx-a11y-x/img-redundant-alt': 'error',
  'jsx-a11y-x/interactive-supports-focus': 'error',
  'jsx-a11y-x/label-has-associated-control': [
    'error',
    {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: 'both',
      depth: 25,
    },
  ],
  'jsx-a11y-x/lang': 'error',
  'jsx-a11y-x/media-has-caption': [
    'error',
    {
      audio: [],
      video: [],
      track: [],
    },
  ],
  'jsx-a11y-x/mouse-events-have-key-events': 'error',
  'jsx-a11y-x/no-access-key': 'error',
  'jsx-a11y-x/no-autofocus': ['error', { ignoreNonDOM: true }],
  'jsx-a11y-x/no-distracting-elements': [
    'error',
    {
      elements: ['marquee', 'blink'],
    },
  ],
  'jsx-a11y-x/no-interactive-element-to-noninteractive-role': [
    'error',
    {
      tr: ['none', 'presentation'],
    },
  ],
  'jsx-a11y-x/no-noninteractive-element-interactions': [
    'error',
    {
      handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
    },
  ],
  'jsx-a11y-x/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
      ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
      li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
      table: ['grid'],
      td: ['gridcell'],
    },
  ],
  'jsx-a11y-x/no-noninteractive-tabindex': [
    'error',
    {
      tags: [],
      roles: ['tabpanel'],
    },
  ],
  'jsx-a11y-x/no-redundant-roles': 'error',
  'jsx-a11y-x/no-static-element-interactions': [
    'error',
    {
      handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
    },
  ],
  'jsx-a11y-x/role-has-required-aria-props': 'error',
  'jsx-a11y-x/role-supports-aria-props': 'error',
  'jsx-a11y-x/scope': 'error',
  'jsx-a11y-x/tabindex-no-positive': 'error',
};
