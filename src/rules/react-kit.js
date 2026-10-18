import build, { merge } from '@eslint-react/kit';

// Rebuilds the eslint-plugin-react 7.37.5 rules @eslint-react has no equivalent for, with the
// same options and defaults; this config's choices live in ./react.js. Each factory's name
// becomes its rule name (kebab-cased).

const CLASS_COMPONENT = /^(?:Pure)?Component$/;
const DOM_ELEMENT = /^[a-z]/;

const isAssignmentTarget = node =>
  node.parent.type === 'AssignmentExpression' && node.parent.left === node;

const findVariable = (scope, name) => {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);

    if (variable) {
      return variable;
    }
  }

  return undefined;
};

// `import { Component as Base } from 'react'` makes `Base` a component superclass too.
const isReactClassImport = (sourceCode, identifier) => {
  const [definition] = findVariable(sourceCode.getScope(identifier), identifier.name)?.defs ?? [];

  return (
    definition?.type === 'ImportBinding' &&
    definition.parent.source.value === 'react' &&
    CLASS_COMPONENT.test(definition.node.imported?.name ?? '')
  );
};

const isInsideClassComponent = (sourceCode, node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') {
      const { superClass } = current;

      if (superClass?.type === 'MemberExpression') {
        return CLASS_COMPONENT.test(superClass.property.name ?? '');
      }

      return (
        superClass?.type === 'Identifier' &&
        (CLASS_COMPONENT.test(superClass.name) || isReactClassImport(sourceCode, superClass))
      );
    }
  }

  return false;
};

// Nodes that bind their own `this`/`super`/`new.target`; uses inside them don't depend on the
// enclosing function.
const REBINDS_THIS = new Set(['FunctionDeclaration', 'FunctionExpression', 'StaticBlock']);

// Whether `node` uses `this`, `arguments`, `super` or `new.target`, whose meaning changes when
// an arrow becomes an ordinary function or the reverse.
const usesFunctionBindings = (sourceCode, node) => {
  const scope = sourceCode.getScope(node);
  // An arrow reads the outer `arguments`; an ordinary function declares its own.
  const usesArguments =
    node.type === 'ArrowFunctionExpression'
      ? scope.through.some(({ identifier }) => identifier.name === 'arguments')
      : scope.set.get('arguments')?.references.length > 0;

  const visit = current => {
    if (typeof current?.type !== 'string') {
      return false;
    }

    switch (current.type) {
      case 'MetaProperty':
        return current.meta.name === 'new';
      case 'Super':
      case 'ThisExpression':
        return true;
      default:
        if (REBINDS_THIS.has(current.type)) {
          return false;
        }
    }

    const isClassField =
      current.type === 'PropertyDefinition' || current.type === 'AccessorProperty';

    return (sourceCode.visitorKeys[current.type] ?? []).some(key => {
      if (isClassField && key === 'value') {
        return false;
      }

      const child = current[key];

      return Array.isArray(child) ? child.some(visit) : visit(child);
    });
  };

  return usesArguments || [...node.params, node.body].some(visit);
};

// The kit collector also counts functions that may return null as components, even through a
// variable initialized to null. Trust a component it named; an unnamed one must return JSX.
const isConfirmedComponent = (sourceCode, { name, rets }) => {
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

const CLASS_MEMBERS = new Set(['context', 'props', 'state']);

const isInClassField = node => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'PropertyDefinition') {
      return true;
    }
  }

  return false;
};

// `this.props`, `this.state` or `this.context`
const isClassMember = node =>
  node?.type === 'MemberExpression' &&
  node.object.type === 'ThisExpression' &&
  CLASS_MEMBERS.has(node.property.name);

/** Same as react/destructuring-assignment. */
function destructuringAssignment() {
  return (context, { collect }) => {
    const [mode = 'always', { destructureInSignature = 'ignore', ignoreClassFields = false } = {}] =
      context.options;
    const { sourceCode } = context;
    const { query, visitor } = collect.components(context);
    // `const { a } = props` and friends, matched to their component on exit.
    const declarators = [];

    const checkParams = node => {
      const [props, legacyContext] = node.params;

      if (mode === 'never') {
        if (props?.type === 'ObjectPattern') {
          context.report({ messageId: 'noDestructPropsInSFCArg', node });
        } else if (legacyContext?.type === 'ObjectPattern') {
          context.report({ messageId: 'noDestructContextInSFCArg', node });
        }

        return;
      }

      for (const [index, param] of [props, legacyContext].entries()) {
        // `props = {}` is still the props object.
        const id = param?.type === 'AssignmentPattern' ? param.left : param;

        if (id?.type !== 'Identifier') {
          continue;
        }

        const variable = sourceCode.getDeclaredVariables(node).find(({ name }) => name === id.name);

        for (const { identifier } of variable?.references ?? []) {
          const { parent } = identifier;
          const isMemberRead =
            parent.type === 'MemberExpression' &&
            parent.object === identifier &&
            !parent.optional &&
            !isAssignmentTarget(parent);
          // `typeof props.a` in a type position
          const isTypeQuery =
            index === 0 && parent.type === 'TSQualifiedName' && parent.left === identifier;

          if (isMemberRead || isTypeQuery) {
            context.report({
              data: { type: isTypeQuery ? 'props' : id.name },
              messageId: 'useDestructAssignment',
              node: parent,
            });
          }
        }
      }
    };

    const checkDeclarator = (declarator, component) => {
      const { init } = declarator;
      const { name } = init;

      if (mode === 'never') {
        context.report({
          data: { type: name },
          messageId: 'noDestructAssignment',
          node: declarator,
        });

        return;
      }

      if (destructureInSignature !== 'always' || name !== 'props') {
        return;
      }

      // Only when `props` is used nowhere else.
      const references = sourceCode.getScope(declarator).set.get('props')?.references;

      if (!references || references.length > 1) {
        return;
      }

      const [param] = component.params;

      context.report({
        fix: param
          ? fixer => [
              fixer.replaceTextRange(
                [
                  param.range[0],
                  param.typeAnnotation ? param.typeAnnotation.range[0] : param.range[1],
                ],
                sourceCode.getText(declarator.id),
              ),
              fixer.remove(declarator.parent),
            ]
          : null,
        messageId: 'destructureInSignature',
        node: declarator,
      });
    };

    return merge(visitor, {
      MemberExpression(node) {
        if (
          mode === 'always' &&
          isClassMember(node.object) &&
          !isAssignmentTarget(node) &&
          !(ignoreClassFields && isInClassField(node)) &&
          isInsideClassComponent(sourceCode, node)
        ) {
          context.report({
            data: { type: node.object.property.name },
            messageId: 'useDestructAssignment',
            node,
          });
        }
      },
      VariableDeclarator(node) {
        if (node.id.type !== 'ObjectPattern' || !node.init) {
          return;
        }

        if (node.init.type === 'Identifier' && ['context', 'props'].includes(node.init.name)) {
          declarators.push(node);
        } else if (
          mode === 'never' &&
          isClassMember(node.init) &&
          isInsideClassComponent(sourceCode, node)
        ) {
          context.report({
            data: { type: node.init.property.name },
            messageId: 'noDestructAssignment',
            node,
          });
        }
      },
      'Program:exit': function (program) {
        const components = new Map();

        for (const component of query.all(program)) {
          if (isConfirmedComponent(sourceCode, component)) {
            components.set(component.node, component);
            checkParams(component.node);
          }
        }

        for (const declarator of declarators) {
          const component = components.get(sourceCode.getScope(declarator).block);

          if (component) {
            checkDeclarator(declarator, component.node);
          }
        }
      },
    });
  };
}

// Positions where an unnamed function is itself the component. A memo/forwardRef callback is
// not one: the wrapper call is the component, so the callback is never reported.
const UNNAMED_COMPONENT_PARENTS = new Set([
  'ArrowFunctionExpression',
  'AssignmentExpression',
  'ExportDefaultDeclaration',
  'ReturnStatement',
  'SequenceExpression',
]);

const FUNCTION_STYLE = {
  ArrowFunctionExpression: 'arrow-function',
  FunctionDeclaration: 'function-declaration',
  FunctionExpression: 'function-expression',
};

const NAMED_TEMPLATES = {
  'arrow-function':
    '{varType} {name}{typeAnnotation} = {async}{typeParams}({params}){returnType} => {body}',
  'function-declaration': '{async}function {name}{typeParams}({params}){returnType} {body}',
  'function-expression':
    '{varType} {name}{typeAnnotation} = {async}function {typeParams}({params}){returnType} {body}',
};

const UNNAMED_TEMPLATES = {
  'arrow-function': '{async}{typeParams}({params}){returnType} => {body}',
  'function-expression': '{async}function {typeParams}({params}){returnType} {body}',
};

/**
 * Same as react/function-component-definition. Fixes are also withheld when they would drop
 * comments, change what `this`/`arguments`/`super`/`new.target` refer to, drop other
 * declarators, or move a declaration below a use of it.
 */
function functionComponentDefinition() {
  return (context, { collect }) => {
    const { namedComponents = 'function-declaration', unnamedComponents = 'function-expression' } =
      context.options[0] ?? {};
    const named = [namedComponents].flat();
    const unnamed = [unnamedComponents].flat();
    const { query, visitor } = collect.components(context);
    const { sourceCode } = context;
    const getText = node => (node ? sourceCode.getText(node) : '');

    const getName = node => (node.type === 'FunctionDeclaration' ? node.id : node.parent.id);
    const hasName = node =>
      node.type === 'FunctionDeclaration' || node.parent.type === 'VariableDeclarator';

    // Parts of the original that the rebuilt text keeps; comments elsewhere would be lost.
    const keptRanges = (node, typeAnnotation) => {
      const kept = [node.body, node.typeParameters, node.returnType, typeAnnotation]
        .filter(Boolean)
        .map(({ range }) => range);

      if (node.params.length) {
        kept.push([node.params[0].range[0], node.params.at(-1).range[1]]);
      }

      return kept;
    };

    const losesComments = (target, kept) =>
      sourceCode
        .getCommentsInside(target)
        .some(({ range }) => !kept.some(([start, end]) => range[0] >= start && range[1] <= end));

    // A `const`/`var` isn't usable before its line, unlike a hoisted function declaration.
    const isUsedBeforeDeclaration = node => {
      const variable = sourceCode
        .getDeclaredVariables(node)
        .find(({ name }) => name === node.id.name);

      return variable?.references.some(({ identifier }) => identifier.range[0] < node.range[0]);
    };

    const getFix = (node, style, template) => {
      const id = hasName(node) ? getName(node) : null;
      const typeAnnotation = node.type === 'FunctionDeclaration' ? null : id?.typeAnnotation;
      const changesFunctionKind =
        (style === 'arrow-function') !== (node.type === 'ArrowFunctionExpression');
      const target = node.type === 'FunctionDeclaration' || !id ? node : node.parent.parent;

      if (
        (style === 'function-declaration' && typeAnnotation) ||
        (style === 'arrow-function' &&
          node.typeParameters?.params.length === 1 &&
          !node.typeParameters.params[0].constraint) ||
        (node.type === 'FunctionDeclaration' && node.parent.type === 'ExportDefaultDeclaration') ||
        (node.type === 'FunctionExpression' && node.id) ||
        (id && id.type !== 'Identifier') ||
        (target.type === 'VariableDeclaration' && target.declarations.length > 1) ||
        (node.type === 'FunctionDeclaration' && node.id && isUsedBeforeDeclaration(node)) ||
        (changesFunctionKind && usesFunctionBindings(sourceCode, node)) ||
        losesComments(target, keptRanges(node, typeAnnotation))
      ) {
        return null;
      }

      const varType = node.parent.type === 'VariableDeclarator' ? node.parent.parent.kind : 'const';
      const params = node.params.length
        ? sourceCode.text.slice(node.params[0].range[0], node.params.at(-1).range[1])
        : '';
      const body =
        node.body.type === 'BlockStatement'
          ? getText(node.body)
          : `{\n  return ${getText(node.body)};\n}`;
      const parts = {
        async: node.async ? 'async ' : '',
        body,
        name: id?.name,
        params,
        returnType: getText(node.returnType),
        typeAnnotation: getText(typeAnnotation),
        typeParams: getText(node.typeParameters),
        varType,
      };
      const text = Object.entries(parts).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, () => value ?? ''),
        template,
      );

      return fixer => fixer.replaceText(target, text);
    };

    const check = (node, styles, templates) => {
      const style = FUNCTION_STYLE[node.type];

      if (styles.includes(style)) {
        return;
      }

      const [preferred] = styles;

      context.report({
        fix: getFix(node, preferred, templates[preferred]),
        messageId: preferred,
        node,
      });
    };

    return merge(visitor, {
      'Program:exit': function (program) {
        for (const component of query.all(program)) {
          const { node } = component;

          if (node.parent.type === 'Property') {
            continue;
          }

          if (hasName(node)) {
            check(node, named, NAMED_TEMPLATES);
          } else if (
            UNNAMED_COMPONENT_PARENTS.has(node.parent.type) &&
            isConfirmedComponent(sourceCode, component)
          ) {
            check(node, unnamed, UNNAMED_TEMPLATES);
          }
        }
      },
    });
  };
}

/** Same as react/jsx-boolean-value. */
function jsxBooleanValue() {
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

        if (literal.value === true) {
          context.report({
            data: { propName },
            fix: fixer => fixer.removeRange([name.range[1], value.range[1]]),
            messageId: 'omitBoolean',
            node,
          });
        } else if (literal.value === false && config.assumeUndefinedIsFalse) {
          context.report({
            data: { propName },
            fix: fixer => fixer.removeRange([name.range[0], value.range[1]]),
            messageId: 'omitPropAndBoolean',
            node,
          });
        }
      },
    };
  };
}

/**
 * Same as react/jsx-no-bind. Flags `.bind()`, arrow functions and functions passed to JSX
 * props, directly or through a const or function declared inside a function body. Also flags
 * `x?.bind()`, which the original misses.
 */
function jsxNoBind() {
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
            node.callee.property.name === 'bind'
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

      if (definition.type === 'Variable' && definition.parent.kind === 'const') {
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

/** Same as react/jsx-no-duplicate-props. Namespaced names are not checked. */
function jsxNoDuplicateProps() {
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

/** Same as react/jsx-no-undef. */
function jsxNoUndef() {
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

// Option schemas and messages match eslint-plugin-react 7.37.5. Kit rules declare neither, and
// without a schema ESLint rejects any options.
const COMPONENT_STYLE = ['function-declaration', 'arrow-function', 'function-expression'];
const UNNAMED_COMPONENT_STYLE = ['arrow-function', 'function-expression'];
const EXCEPTIONS = { type: 'array', items: { type: 'string', minLength: 1 }, uniqueItems: true };

const booleanOptions = (...names) => [
  {
    type: 'object',
    properties: Object.fromEntries(names.map(name => [name, { type: 'boolean' }])),
    additionalProperties: false,
  },
];

const META = {
  'destructuring-assignment': {
    messages: {
      destructureInSignature: 'Must destructure props in the function signature.',
      noDestructAssignment: 'Must never use destructuring {{type}} assignment',
      noDestructContextInSFCArg: 'Must never use destructuring context assignment in SFC argument',
      noDestructPropsInSFCArg: 'Must never use destructuring props assignment in SFC argument',
      useDestructAssignment: 'Must use destructuring {{type}} assignment',
    },
    schema: [
      { type: 'string', enum: ['always', 'never'] },
      {
        type: 'object',
        properties: {
          destructureInSignature: { type: 'string', enum: ['always', 'ignore'] },
          ignoreClassFields: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  'function-component-definition': {
    messages: {
      'arrow-function': 'Function component is not an arrow function',
      'function-declaration': 'Function component is not a function declaration',
      'function-expression': 'Function component is not a function expression',
    },
    schema: [
      {
        type: 'object',
        properties: {
          namedComponents: {
            anyOf: [
              { enum: COMPONENT_STYLE },
              { type: 'array', items: { type: 'string', enum: COMPONENT_STYLE } },
            ],
          },
          unnamedComponents: {
            anyOf: [
              { enum: UNNAMED_COMPONENT_STYLE },
              { type: 'array', items: { type: 'string', enum: UNNAMED_COMPONENT_STYLE } },
            ],
          },
        },
      },
    ],
  },
  'jsx-boolean-value': {
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
  },
  'jsx-no-bind': {
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
  },
  'jsx-no-duplicate-props': {
    messages: { noDuplicateProps: 'No duplicate props allowed' },
    schema: booleanOptions('ignoreCase'),
  },
  'jsx-no-undef': {
    messages: { undefined: "'{{name}}' is not defined." },
    schema: booleanOptions('allowGlobals'),
  },
};

const plugin = build()
  .use(destructuringAssignment)
  .use(functionComponentDefinition)
  .use(jsxBooleanValue)
  .use(jsxNoBind)
  .use(jsxNoDuplicateProps)
  .use(jsxNoUndef)
  .getPlugin();

for (const [name, meta] of Object.entries(META)) {
  Object.assign(plugin.rules[name].meta, meta);
}

export default plugin;
