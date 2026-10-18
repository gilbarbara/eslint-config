import { booleanOptions, DOM_ELEMENT } from './utils.js';

export const meta = {
  messages: { undefined: "'{{name}}' is not defined." },
  schema: booleanOptions('allowGlobals'),
};

/** Same as react/jsx-no-undef. */
export function jsxNoUndef() {
  return context => ({
    JSXOpeningElement(node) {
      let identifier = node.name;

      if (identifier.type === 'JSXNamespacedName') {
        return;
      }

      if (identifier.type === 'JSXIdentifier' && DOM_ELEMENT.test(identifier.name)) {
        return;
      }

      while (identifier.type === 'JSXMemberExpression') {
        identifier = identifier.object;
      }

      if (identifier.name === 'this') {
        return;
      }

      // Unless allowGlobals is set, module code only sees module-level declarations.
      const skipGlobals =
        !context.options[0]?.allowGlobals && context.sourceCode.ast.sourceType === 'module';

      for (let scope = context.sourceCode.getScope(node); scope; scope = scope.upper) {
        if (scope.type === 'global' && skipGlobals) {
          break;
        }

        if (scope.set.has(identifier.name)) {
          return;
        }
      }

      context.report({ data: { name: identifier.name }, messageId: 'undefined', node: identifier });
    },
  });
}
