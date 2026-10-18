import build from '@eslint-react/kit';

import * as destructuringAssignment from './destructuring-assignment.js';
import * as functionComponentDefinition from './function-component-definition.js';
import * as jsxBooleanValue from './jsx-boolean-value.js';
import * as jsxNoBind from './jsx-no-bind.js';
import * as jsxNoDuplicateProps from './jsx-no-duplicate-props.js';
import * as jsxNoUndef from './jsx-no-undef.js';

// Rebuilds the eslint-plugin-react 7.37.5 rules @eslint-react has no equivalent for, with the
// same options and defaults; this config's choices live in ../react.js. Kit names each rule
// after its factory function (kebab-cased).
const RULES = {
  'destructuring-assignment': [
    destructuringAssignment.destructuringAssignment,
    destructuringAssignment.meta,
  ],
  'function-component-definition': [
    functionComponentDefinition.functionComponentDefinition,
    functionComponentDefinition.meta,
  ],
  'jsx-boolean-value': [jsxBooleanValue.jsxBooleanValue, jsxBooleanValue.meta],
  'jsx-no-bind': [jsxNoBind.jsxNoBind, jsxNoBind.meta],
  'jsx-no-duplicate-props': [jsxNoDuplicateProps.jsxNoDuplicateProps, jsxNoDuplicateProps.meta],
  'jsx-no-undef': [jsxNoUndef.jsxNoUndef, jsxNoUndef.meta],
};

const builder = build();

for (const [factory] of Object.values(RULES)) {
  builder.use(factory);
}

const plugin = builder.getPlugin();

// Kit rules declare no schema or messages; without a schema ESLint rejects any options.
for (const [name, [, meta]] of Object.entries(RULES)) {
  Object.assign(plugin.rules[name].meta, meta);
}

export default plugin;
