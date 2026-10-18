const EXCEPTIONS = { type: 'array', items: { type: 'string', minLength: 1 }, uniqueItems: true };

export const meta = {
  messages: {
    omitBoolean: 'Value must be omitted for boolean attribute `{{propName}}`',
    omitPropAndBoolean: 'Value must be omitted for `false` attribute: `{{propName}}`',
    setBoolean: 'Value must be set for boolean attribute `{{propName}}`',
  },
  schema: {
    anyOf: [
      { type: 'array', items: [{ enum: ['always', 'never'] }], additionalItems: false },
      {
        type: 'array',
        items: [
          { enum: ['always'] },
          {
            type: 'object',
            additionalProperties: false,
            properties: { never: EXCEPTIONS, assumeUndefinedIsFalse: { type: 'boolean' } },
          },
        ],
        additionalItems: false,
      },
      {
        type: 'array',
        items: [
          { enum: ['never'] },
          {
            type: 'object',
            additionalProperties: false,
            properties: { always: EXCEPTIONS, assumeUndefinedIsFalse: { type: 'boolean' } },
          },
        ],
        additionalItems: false,
      },
    ],
  },
};

/** Same as react/jsx-boolean-value. */
export function jsxBooleanValue() {
  return context => {
    const [mode = 'never', config = {}] = context.options;
    const exceptions = new Set((mode === 'always' ? config.never : config.always) ?? []);

    return {
      JSXAttribute(node) {
        const { name, value } = node;
        const propName =
          name.type === 'JSXIdentifier' ? name.name : context.sourceCode.getText(name);
        // An exception flips the mode for that prop.
        const isException = exceptions.has(propName);
        const always = mode === 'always' ? !isException : isException;
        const literal = value?.type === 'JSXExpressionContainer' ? value.expression : null;

        if (always && value === null) {
          context.report({
            data: { propName },
            fix: fixer => fixer.insertTextAfter(node, '={true}'),
            messageId: 'setBoolean',
            node,
          });
        }

        if (always || literal?.type !== 'Literal') {
          return;
        }

        // Removing the value would remove a comment inside it.
        const keepsComments = context.sourceCode.getCommentsInside(value).length === 0;

        if (literal.value === true) {
          context.report({
            data: { propName },
            fix: keepsComments ? fixer => fixer.removeRange([name.range[1], value.range[1]]) : null,
            messageId: 'omitBoolean',
            node,
          });
        } else if (literal.value === false && config.assumeUndefinedIsFalse) {
          context.report({
            data: { propName },
            fix: keepsComments ? fixer => fixer.removeRange([name.range[0], value.range[1]]) : null,
            messageId: 'omitPropAndBoolean',
            node,
          });
        }
      },
    };
  };
}
