import { merge } from '@eslint-react/kit';

import { findVariable, isConfirmedComponent, losesComments } from './utils.js';

const CLASS_COMPONENT = /^(?:Pure)?Component$/;

const isAssignmentTarget = node =>
  node.parent.type === 'AssignmentExpression' && node.parent.left === node;

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

const CLASS_MEMBERS = new Set(['context', 'props', 'state']);

const isInClassField = node => {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'PropertyDefinition') {
      return true;
    }
  }

  return false;
};

const hasDefaultsOrComputedKeys = pattern => {
  switch (pattern?.type) {
    case 'ArrayPattern':
      return pattern.elements.some(hasDefaultsOrComputedKeys);
    case 'AssignmentPattern':
      return true;
    case 'ObjectPattern':
      return pattern.properties.some(property =>
        property.type === 'RestElement'
          ? hasDefaultsOrComputedKeys(property.argument)
          : property.computed || hasDefaultsOrComputedKeys(property.value),
      );
    default:
      return false;
  }
};

const hasUseStrict = node =>
  node.body.type === 'BlockStatement' &&
  node.body.body.some(statement => statement.directive === 'use strict');

// `this.props`, `this.state` or `this.context`, not `this[props]`
const isClassMember = node =>
  node?.type === 'MemberExpression' &&
  node.object.type === 'ThisExpression' &&
  !node.computed &&
  CLASS_MEMBERS.has(node.property.name);

export const meta = {
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
};

/**
 * Same as react/destructuring-assignment, except `createReactClass` components aren't checked
 * and a defaulted `props = {}` param is.
 */
export function destructuringAssignment() {
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
      // The fix rewrites the first param, so it must be `props` itself. Defaults and computed
      // keys would run at parameter time, before body locals exist; removing the declaration
      // would drop any other declarator in it; a pattern can't take two type annotations; a
      // `'use strict'` body forbids a non-simple param list; and comments outside the copied
      // pattern and the kept param type would be lost.
      const canMove =
        param?.type === 'Identifier' &&
        param.name === 'props' &&
        !(param.typeAnnotation && declarator.id.typeAnnotation) &&
        !hasDefaultsOrComputedKeys(declarator.id) &&
        declarator.parent.declarations.length === 1 &&
        !hasUseStrict(component) &&
        !losesComments(sourceCode, declarator.parent, [declarator.id.range]) &&
        !losesComments(sourceCode, param, param.typeAnnotation ? [param.typeAnnotation.range] : []);
      const pattern = sourceCode.getText(declarator.id);
      // `props => ...` needs parentheses once the param is a pattern.
      const isParenthesized = canMove && sourceCode.getTokenBefore(param).value === '(';

      context.report({
        fix: canMove
          ? fixer => [
              fixer.replaceTextRange(
                [
                  param.range[0],
                  param.typeAnnotation ? param.typeAnnotation.range[0] : param.range[1],
                ],
                isParenthesized ? pattern : `(${pattern})`,
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
