import { booleanOptions, DOM_ELEMENT, findVariable } from './utils.js';

// `x.bind` and `x['bind']` name `bind`; `x[bind]` names whatever `bind` holds.
const getPropertyName = ({ computed, property }) => {
  if (!computed) {
    return property.name;
  }

  return property.type === 'Literal' ? property.value : null;
};

export const meta = {
  messages: {
    arrowFunc: 'JSX props should not use arrow functions',
    bindCall: 'JSX props should not use .bind()',
    func: 'JSX props should not use functions',
  },
  schema: booleanOptions(
    'allowArrowFunctions',
    'allowBind',
    'allowFunctions',
    'ignoreRefs',
    'ignoreDOMComponents',
  ),
};

/**
 * Same as react/jsx-no-bind. Flags `.bind()`, arrow functions and functions passed to JSX
 * props, directly or through a const or function declared inside a function body. Also flags
 * `x?.bind()`, which the original misses.
 */
export function jsxNoBind() {
  return context => {
    const {
      allowArrowFunctions = false,
      allowBind = false,
      allowFunctions = false,
      ignoreDOMComponents = false,
      ignoreRefs = false,
    } = context.options[0] ?? {};

    const getViolation = node => {
      switch (node?.type) {
        case 'ArrowFunctionExpression':
          return allowArrowFunctions ? null : 'arrowFunc';
        case 'CallExpression':
          return !allowBind &&
            node.callee.type === 'MemberExpression' &&
            getPropertyName(node.callee) === 'bind'
            ? 'bindCall'
            : null;
        case 'ChainExpression':
          return getViolation(node.expression);
        case 'ConditionalExpression':
          return (
            getViolation(node.test) ?? getViolation(node.consequent) ?? getViolation(node.alternate)
          );
        case 'FunctionDeclaration':
        case 'FunctionExpression':
          return allowFunctions ? null : 'func';
        default:
          return null;
      }
    };

    const getVariableViolation = (scope, name) => {
      const variable = findVariable(scope, name);
      const [definition] = variable?.defs ?? [];

      if (!definition || ['global', 'module'].includes(variable.scope.type)) {
        return null;
      }

      if (definition.type === 'FunctionName') {
        return getViolation(definition.node);
      }

      // Only `const x = ...`: in `const { x } = ...` the initializer isn't what `x` holds.
      if (
        definition.type === 'Variable' &&
        definition.parent.kind === 'const' &&
        definition.node.id === definition.name
      ) {
        return getViolation(definition.node.init);
      }

      return null;
    };

    return {
      JSXAttribute(node) {
        const expression = node.value?.expression;

        if (!expression || (ignoreRefs && node.name.name === 'ref')) {
          return;
        }

        if (ignoreDOMComponents && DOM_ELEMENT.test(context.sourceCode.getText(node.parent.name))) {
          return;
        }

        const messageId =
          expression.type === 'Identifier'
            ? getVariableViolation(context.sourceCode.getScope(node), expression.name)
            : getViolation(expression);

        if (messageId) {
          context.report({ messageId, node });
        }
      },
    };
  };
}
