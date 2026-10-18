import { merge } from '@eslint-react/kit';

import { isConfirmedComponent, losesComments } from './utils.js';

const COMPONENT_STYLE = ['function-declaration', 'arrow-function', 'function-expression'];
const UNNAMED_COMPONENT_STYLE = ['arrow-function', 'function-expression'];

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

// Positions where an unnamed function is itself the component. A memo/forwardRef callback is
// not one: the wrapper call is the component, so the callback is never reported.
const UNNAMED_COMPONENT_PARENTS = new Set([
  'ArrowFunctionExpression',
  'AssignmentExpression',
  'ExportDefaultDeclaration',
  'ReturnStatement',
  'SequenceExpression',
]);

const FOR_STATEMENTS = new Set(['ForInStatement', 'ForOfStatement', 'ForStatement']);

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

export const meta = {
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
};

/**
 * Same as react/function-component-definition. Fixes are also withheld when they would drop
 * comments, change what `this`/`arguments`/`super`/`new.target` refer to, drop other
 * declarators, move a declaration below a use of it, make a reassigned function `const`, put a
 * function declaration in a `for` header or in place of a `var`, separate TS overloads from
 * their implementation, put a TS `this` param on an arrow, or turn a generator into an arrow.
 */
export function functionComponentDefinition() {
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

    // A `const` isn't usable before its line, unlike a hoisted function declaration, and can't
    // be reassigned.
    const breaksAsConst = node => {
      const variable = sourceCode
        .getDeclaredVariables(node)
        .find(({ name }) => name === node.id.name);

      return variable?.references.some(
        reference => reference.isWrite() || reference.identifier.range[0] < node.range[0],
      );
    };

    // TS overload signatures would be left behind without their implementation.
    const hasOverloads = node =>
      node.type === 'FunctionDeclaration' &&
      sourceCode.getDeclaredVariables(node).some(({ defs }) => defs.length > 1);

    // A TS `this` param is only allowed on ordinary functions.
    const hasThisParam = node =>
      node.params[0]?.type === 'Identifier' && node.params[0].name === 'this';

    // In TSX, `<T>() => ...` parses as JSX.
    const hasBareTypeParam = node =>
      node.typeParameters?.params.length === 1 && !node.typeParameters.params[0].constraint;

    // Shapes no template can rebuild: the `*`, overload signatures, an inner function name, a
    // destructured id or a sibling declarator would be lost, and `export default function` has
    // no `const` form.
    const isRebuildable = (node, id, target) =>
      !node.generator &&
      !hasOverloads(node) &&
      !(node.type === 'FunctionDeclaration' && node.parent.type === 'ExportDefaultDeclaration') &&
      !(node.type === 'FunctionExpression' && node.id) &&
      !(id && id.type !== 'Identifier') &&
      !(target.type === 'VariableDeclaration' && target.declarations.length > 1);

    // Limits of the style being converted to.
    const fitsStyle = (style, node, target, typeAnnotation) => {
      switch (style) {
        case 'arrow-function':
          return !hasThisParam(node) && !hasBareTypeParam(node);
        case 'function-declaration':
          // A declaration takes no variable type, can't sit in a `for` header, and in a block
          // doesn't reach the whole function the way a `var` does.
          return (
            !typeAnnotation && !FOR_STATEMENTS.has(target.parent.type) && target.kind !== 'var'
          );
        default:
          return true;
      }
    };

    const getFix = (node, style, template) => {
      const id = hasName(node) ? getName(node) : null;
      const typeAnnotation = node.type === 'FunctionDeclaration' ? null : id?.typeAnnotation;
      const changesFunctionKind =
        (style === 'arrow-function') !== (node.type === 'ArrowFunctionExpression');
      const target = node.type === 'FunctionDeclaration' || !id ? node : node.parent.parent;

      if (
        !isRebuildable(node, id, target) ||
        !fitsStyle(style, node, target, typeAnnotation) ||
        (node.type === 'FunctionDeclaration' && node.id && breaksAsConst(node)) ||
        (changesFunctionKind && usesFunctionBindings(sourceCode, node)) ||
        losesComments(sourceCode, target, keptRanges(node, typeAnnotation))
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
      // One pass over the template, so source text that looks like a slot (`{name}`) is kept.
      const text = template.replace(/\{(\w+)\}/g, (_, key) => parts[key] ?? '');
      // `const C = ...` is a statement of its own unless it sits in a `for` header.
      const terminator =
        hasName(node) && style !== 'function-declaration' && !FOR_STATEMENTS.has(target.parent.type)
          ? ';'
          : '';

      return fixer => fixer.replaceText(target, `${text}${terminator}`);
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
