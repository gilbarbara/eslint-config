// Helpers shared by more than one @gilbarbara/* rule.

export const DOM_ELEMENT = /^[a-z]/;

export const findVariable = (scope, name) => {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);

    if (variable) {
      return variable;
    }
  }

  return undefined;
};

// The kit collector also counts functions that may return null as components, even through a
// variable initialized to null. Trust a component it named; an unnamed one must return JSX.
export const isConfirmedComponent = (sourceCode, { name, rets }) => {
  // `seen` stops self-referencing initializers (`const a = x ? a : <div />`).
  const isJsx = (node, seen) => {
    switch (node?.type) {
      case 'JSXElement':
      case 'JSXFragment':
        return true;
      case 'ConditionalExpression':
        return isJsx(node.consequent, seen) || isJsx(node.alternate, seen);
      case 'LogicalExpression':
        return isJsx(node.left, seen) || isJsx(node.right, seen);
      case 'Identifier': {
        const variable = findVariable(sourceCode.getScope(node), node.name);
        const [definition] = variable?.defs ?? [];

        if (!definition || definition.type !== 'Variable' || seen.has(variable)) {
          return false;
        }

        seen.add(variable);

        return isJsx(definition.node.init, seen);
      }

      default:
        return false;
    }
  };

  return Boolean(name) || rets.some(returnValue => isJsx(returnValue, new Set()));
};

// Whether rewriting `target` would drop a comment that isn't inside one of the `kept` ranges.
export const losesComments = (sourceCode, target, kept) =>
  sourceCode
    .getCommentsInside(target)
    .some(({ range }) => !kept.some(([start, end]) => range[0] >= start && range[1] <= end));

// Option schema for an object of boolean flags.
export const booleanOptions = (...names) => [
  {
    type: 'object',
    properties: Object.fromEntries(names.map(name => [name, { type: 'boolean' }])),
    additionalProperties: false,
  },
];
