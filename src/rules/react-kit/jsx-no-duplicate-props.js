import { booleanOptions } from './utils.js';

export const meta = {
  messages: { noDuplicateProps: 'No duplicate props allowed' },
  schema: booleanOptions('ignoreCase'),
};

/** Same as react/jsx-no-duplicate-props. Namespaced names are not checked. */
export function jsxNoDuplicateProps() {
  return context => {
    const ignoreCase = context.options[0]?.ignoreCase ?? false;

    return {
      JSXOpeningElement(node) {
        const names = new Set();

        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute' || attribute.name.type !== 'JSXIdentifier') {
            continue;
          }

          const name = ignoreCase ? attribute.name.name.toLowerCase() : attribute.name.name;

          if (names.has(name)) {
            context.report({ messageId: 'noDuplicateProps', node: attribute });
          } else {
            names.add(name);
          }
        }
      },
    };
  };
}
