import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { rules } from '../utils/rule-tester.js';

// Every autofix, across input shapes and option sets, must produce code that parses, keeps the
// input's identifiers, literals and comments, and doesn't change again on a second run.

const linter = new Linter({ configType: 'flat' });

const languageOptions = extension => ({
  ...(extension === 'tsx' && { parser: tseslint.parser }),
  parserOptions: { ecmaFeatures: { jsx: true } },
});

const config = (rule, options, extension) => [
  {
    files: [`**/*.${extension}`],
    languageOptions: languageOptions(extension),
    plugins: { '@gilbarbara': { rules } },
    rules: { [`@gilbarbara/${rule}`]: ['error', ...options] },
  },
];

const TOKEN = /\/\*[\s\S]*?\*\/|\/\/.*|[a-z_$][\w$]*|'[^']*'|"[^"]*"|`[^`]*`|\d+/gi;
// Words a function-style conversion adds or removes.
const SYNTAX = ['const', 'function', 'let', 'return', 'var'];

const fix = (rule, options, code, extension) =>
  linter.verifyAndFix(code, config(rule, options, extension), `component.${extension}`);

/** Returns why the fix of `code` is unsafe, or nothing when it's safe or not applied. */
function inspect(rule, options, code, extension, droppable) {
  const { fixed, output } = fix(rule, options, code, extension);

  if (!fixed) {
    return { fixed };
  }

  const problems = [];
  const fatal = linter
    .verify(
      output,
      [{ files: [`**/*.${extension}`], languageOptions: languageOptions(extension) }],
      `component.${extension}`,
    )
    .find(message => message.fatal);
  const kept = new Set(output.match(TOKEN));
  const lost = [...new Set(code.match(TOKEN))].filter(
    token => !kept.has(token) && !droppable.includes(token),
  );

  if (fatal) {
    problems.push(`doesn't parse: ${fatal.message}`);
  }

  if (lost.length) {
    problems.push(`drops ${lost.join(', ')}`);
  }

  if (fix(rule, options, output, extension).fixed) {
    problems.push('changes again on a second run');
  }

  return { fixed, problems: problems.length ? { code, output, problems } : null };
}

// JSX content named like the fix templates' slots, which a template must not consume.
const BODIES = [
  '<div>{a}</div>',
  '<div>{name}{params}{body}{varType}{typeAnnotation}{returnType}{typeParams}{async}</div>',
  '(\n  <div>{a}</div>\n)',
  '<>{a}</>',
];

const COMPONENTS = [
  // Named
  body => `export const C = () => ${body};`,
  body => `export const C = ({ a }) => ${body};`,
  body => `export const C = async ({ a }) => ${body};`,
  body => `export const C = function () {\n  return ${body};\n};`,
  body => `export function C({ a }) {\n  return ${body};\n}`,
  body => `function C({ a }) {\n  return ${body};\n}\nexport { C };`,
  body => `export const C = ({ a }) => ${body}; const n = 1;`,
  body => `export const C = ({ a }) => ${body}\n;[1].forEach(String);`,
  body => `export function C({ a }) {\n  return ${body};\n}\n(function init() {})();`,
  body => `export const C = ({ a } = {}) => ${body};`,
  body => `export const C = (props, ref) => ${body};`,
  body => `export function* C({ a }) {\n  return ${body};\n}`,
  body => `function C({ a }) {\n  return ${body};\n}\nC = wrap(C);\nexport { C };`,
  body => `export function f(x) {\n  if (x) {\n    var C = () => ${body};\n  }\n  return C;\n}`,
  body => `for (const C = () => ${body}; go(); ) {\n  use(C);\n}`,
  // Unnamed
  body => `export default () => ${body};`,
  body => `export default ({ a }) => ${body};`,
  body => `export function wrap(X) {\n  return props => ${body};\n}`,
  body => `export function wrap(X) {\n  return function (props) {\n    return ${body};\n  };\n}`,
  body => `export const hoc = X => props => ${body};`,
];

const TSX_COMPONENTS = [
  'export const C = <T,>({ a }: { a: T }): JSX.Element => <div>{String(a)}</div>;',
  'export const C: FC<P> = ({ a }) => <div>{a}</div>;',
  'export function C<T extends object>({ a }: { a: T }): JSX.Element {\n  return <div>{String(a)}</div>;\n}',
  'export function C<T>({ a }: { a: T }): JSX.Element {\n  return <div>{String(a)}</div>;\n}',
];

const DECLARATIONS = [
  'const { a } = props;',
  'const { a = fallback } = props;',
  'const { [key]: a } = props;',
  'const { a, ...rest } = props;',
  'const { a } = props, b = load();',
  'const { a: { b } } = props;',
  'const /* why */ { a } = props;',
  'const { a } = /* why */ props;',
];

const SIGNATURES = [
  declaration =>
    `export function C(props) {\n  const fallback = 'x';\n  const key = 'k';\n  ${declaration}\n  return <div>{a}</div>;\n}`,
  declaration => `export const C = props => {\n  ${declaration}\n  return <div>{a}</div>;\n};`,
  declaration =>
    `export function C(props) {\n  'use strict';\n  ${declaration}\n  return <div>{a}</div>;\n}`,
  declaration => `export const C = (props) => {\n  ${declaration}\n  return <div>{a}</div>;\n};`,
  declaration =>
    `export function C(props, ref) {\n  ${declaration}\n  return <div ref={ref}>{a}</div>;\n}`,
  declaration =>
    `export function C(ref, props) {\n  ${declaration}\n  return <div ref={ref}>{a}</div>;\n}`,
];

const ATTRIBUTES = [
  'export const a = <App foo={true} />;',
  'export const a = <App foo />;',
  'export const a = <App foo={false} bar />;',
  'export const a = <App foo={/* why */ true} />;',
  'export const a = <App foo={true}>{name}</App>;',
];

const MATRIX = [
  ...[
    [],
    [{ namedComponents: 'arrow-function' }],
    [{ namedComponents: 'function-expression' }],
    [{ unnamedComponents: 'arrow-function' }],
    [{ namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }],
  ].map(options => ({
    cases: [
      ...BODIES.flatMap(body => COMPONENTS.map(component => [component(body), 'jsx'])),
      ...TSX_COMPONENTS.map(code => [code, 'tsx']),
    ],
    droppable: SYNTAX,
    options,
    rule: 'function-component-definition',
  })),
  {
    cases: [
      ...DECLARATIONS.flatMap(declaration =>
        SIGNATURES.map(signature => [signature(declaration), 'jsx']),
      ),
      [
        'export function C(props: Props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
        'tsx',
      ],
      ...[
        'export function C(props) {\n  const { a }: Props = props;\n  return <div>{a}</div>;\n}',
        'export function C(props: Props) {\n  const { a }: Props = props;\n  return <div>{a}</div>;\n}',
        'export function C(this: Window, props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
      ].map(code => [code, 'tsx']),
    ],
    // The fix replaces the `props` param with its destructuring.
    droppable: ['const', 'props'],
    options: ['always', { destructureInSignature: 'always' }],
    rule: 'destructuring-assignment',
  },
  ...[[], ['always'], ['never', { assumeUndefinedIsFalse: true }]].map(options => ({
    cases: ATTRIBUTES.map(code => [code, 'jsx']),
    // The fixes remove `={true}`, or `foo={false}` entirely.
    droppable: ['true', 'false', 'foo'],
    options,
    rule: 'jsx-boolean-value',
  })),
];

describe('autofix safety', () => {
  it.each(MATRIX.map(entry => [`${entry.rule} ${JSON.stringify(entry.options)}`, entry]))(
    '%s',
    (_, { cases, droppable, options, rule }) => {
      const results = cases.map(([code, extension]) =>
        inspect(rule, options, code, extension, droppable),
      );

      expect(results.map(result => result.problems).filter(Boolean)).toEqual([]);
      // At least one fix applied, so the checks above aren't vacuous.
      expect(results.some(result => result.fixed)).toBe(true);
    },
  );
});
