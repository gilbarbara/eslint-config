import { ESLint, Linter } from 'eslint';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createESLintWithConfig,
  fixWithKitRule,
  getAllViolations,
  getConfigPath,
  getFixturePath,
  getViolationsForRule,
  lintFile,
} from '../utils/helpers.js';

describe('ESLint Integration Tests', () => {
  describe('Base Configuration Integration', () => {
    let eslint;

    beforeAll(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('base'));
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it('should detect import ordering issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const importViolations = getViolationsForRule(result, 'perfectionist/sort-imports');

      expect(importViolations.length).toBeGreaterThan(0);
      expect(importViolations[0].severity).toBe(2);
    });

    it('should detect destructuring key sorting issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const destructureViolations = getViolationsForRule(
        result,
        'sort-destructure-keys/sort-destructure-keys',
      );

      expect(destructureViolations.length).toBeGreaterThan(0);
    });

    it('should detect unused imports', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const unusedImportViolations = getViolationsForRule(
        result,
        'unused-imports/no-unused-imports',
      );

      expect(unusedImportViolations.length).toBeGreaterThan(0);
    });

    it('should detect promise issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const promiseViolations = getViolationsForRule(result, 'promise/catch-or-return');

      expect(promiseViolations.length).toBeGreaterThan(0);
    });

    it('should detect regexp issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const regexpViolations = getViolationsForRule(result, 'regexp/no-useless-character-class');

      expect(regexpViolations.length).toBeGreaterThan(0);
    });

    it('should detect sonarjs issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const sonarViolations = getViolationsForRule(result, 'sonarjs/no-all-duplicated-branches');

      expect(sonarViolations.length).toBeGreaterThan(0);
    });
  });

  describe('TypeScript Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('base'));
    });

    it('should detect unused variables in TypeScript', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));
      const unusedVarViolations = getViolationsForRule(result, '@typescript-eslint/no-unused-vars');

      expect(unusedVarViolations.length).toBeGreaterThan(0);
      expect(unusedVarViolations[0].severity).toBe(1);
    });

    it('should handle TypeScript syntax correctly', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));

      expect(result.fatalErrorCount).toBe(0);
      expect(result.messages.some(message => message.fatal)).toBe(false);
    });

    it('should resolve TypeScript type imports', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts-import.ts'));
      const unresolvedViolations = getViolationsForRule(result, 'import-x/no-unresolved');

      expect(unresolvedViolations).toHaveLength(0);
    });

    it('should not warn about padding before exported function overload implementation', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));
      const paddingViolations = getViolationsForRule(
        result,
        '@stylistic/padding-line-between-statements',
      );

      // Only the missing blank line between export const and export function should warn
      expect(paddingViolations).toHaveLength(1);
      expect(paddingViolations[0].line).toBe(48);
    });
  });

  describe('React Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('index'));
    });

    it('should detect JSX accessibility issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const a11yViolations = result.messages.filter(
        message => message.ruleId && message.ruleId.startsWith('jsx-a11y-x/'),
      );

      expect(a11yViolations.length).toBeGreaterThan(0);
      expect(a11yViolations.some(v => v.ruleId === 'jsx-a11y-x/alt-text')).toBe(true);
    });

    it('should lint .jsx files with the react config alone', async () => {
      const reactOnly = await createESLintWithConfig(getConfigPath('react'));
      const [result] = await reactOnly.lintText(
        'export const a = <Widget id="1" className="2" />;\n',
        { filePath: getFixturePath('inline.jsx') },
      );

      expect(result.messages.map(m => m.ruleId)).toEqual([
        '@gilbarbara/jsx-no-undef',
        'perfectionist/sort-jsx-props',
      ]);
    });

    it('should detect React Hook dependency issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const hookViolations = getViolationsForRule(result, 'react-hooks/exhaustive-deps');

      expect(hookViolations.length).toBeGreaterThan(0);
      expect(hookViolations[0].severity).toBe(1);
    });

    it('should detect React Refresh export issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const refreshViolations = getViolationsForRule(
        result,
        'react-refresh/only-export-components',
      );

      expect(refreshViolations.length).toBeGreaterThan(0);
    });
  });

  // The @gilbarbara/* kit recipes must report where the eslint-plugin-react rules they
  // replace did; the line numbers below were captured from those originals.
  describe('React Kit Rules Integration', () => {
    let result;

    beforeEach(async () => {
      const eslint = await createESLintWithConfig(getConfigPath('index'));

      result = await lintFile(eslint, getFixturePath('sample-react-custom-rules.jsx'));
    });

    it('should flag props access that is not destructured', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/destructuring-assignment');

      expect(violations).toHaveLength(2);
      expect(violations.every(v => v.severity === 2)).toBe(true);
      expect(violations.map(v => v.line)).toEqual([7, 17]);
    });

    it('should flag this.props, this.state and this.context reads in class components', async () => {
      const code = [
        "import React, { Component, PureComponent } from 'react';",
        'export class A extends React.Component {',
        '  render() {',
        '    this.state.x = 1;',
        '    return <div>{this.props.a}{this.state.b}{this.context.c}</div>;',
        '  }',
        '}',
        'export class B extends PureComponent {',
        '  render() {',
        '    return <div>{this.props.a}</div>;',
        '  }',
        '}',
        'export class C extends Store {',
        '  read() {',
        '    return this.props.a;',
        '  }',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('destructuring-assignment', code);

      expect(messages.map(m => [m.line, m.message])).toEqual([
        [5, 'Must use destructuring props assignment'],
        [5, 'Must use destructuring state assignment'],
        [5, 'Must use destructuring context assignment'],
        [10, 'Must use destructuring props assignment'],
      ]);
    });

    it('should skip optional reads and writes of function component params', async () => {
      const code = [
        'export function F(props, context) {',
        '  props.a = 1;',
        '  return <div>{props?.b}{context.c}</div>;',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('destructuring-assignment', code);

      expect(messages.map(m => [m.line, m.message])).toEqual([
        [3, 'Must use destructuring context assignment'],
      ]);
    });

    it('should flag defaulted props params and aliased React superclasses', async () => {
      const code = [
        "import { Component as Base } from 'react';",
        'export function View(props = {}) {',
        '  return <div>{props.title}</div>;',
        '}',
        'export class Aliased extends Base {',
        '  render() {',
        '    return <div>{this.props.title}</div>;',
        '  }',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('destructuring-assignment', code);

      expect(messages.map(m => [m.line, m.message])).toEqual([
        [3, 'Must use destructuring props assignment'],
        [7, 'Must use destructuring props assignment'],
      ]);
    });

    it('should only check unnamed functions that return JSX', async () => {
      const code = [
        'export function makeFinder(items) {',
        '  return options => {',
        '    if (!options.id) return null;',
        '    return items.find(item => item.id === options.id);',
        '  };',
        '}',
        'export function makeGetter(source) {',
        '  let cached = null;',
        '  return options => {',
        '    cached ??= source.load(options.key);',
        '    return cached;',
        '  };',
        '}',
        'export function wrap(C) {',
        '  return props => <C label={props.label} />;',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('destructuring-assignment', code);

      expect(messages.map(m => [m.line, m.message])).toEqual([
        [15, 'Must use destructuring props assignment'],
      ]);
    });

    it('should flag named components defined as arrow functions', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/function-component-definition');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(11);
    });

    it.each([
      ['jsx', 'export const A = () => <div />;', 'export function A() {\n  return <div />;\n}'],
      [
        'jsx',
        'const B = async ({ a }) => {\n  return <div>{a}</div>;\n};',
        'async function B({ a }) {\n  return <div>{a}</div>;\n}',
      ],
      [
        'tsx',
        'const C = <T,>({ v }: { v: T }): JSX.Element => <div>{String(v)}</div>;',
        'function C<T,>({ v }: { v: T }): JSX.Element {\n  return <div>{String(v)}</div>;\n}',
      ],
      // Not fixed: named function expression, multiple declarators, typed variable
      ['jsx', 'const D = function Inner() {\n  return <div />;\n};', null],
      ['jsx', 'const E = () => <div />,\n  f = 1;', null],
      ['tsx', 'const G: FC = () => <div />;', null],
      // Not fixed: the rebuilt function would drop a comment
      ['jsx', 'const H = () => (\n  // note\n  <div />\n);', null],
      ['jsx', 'const I = /* note */ () => <div />;', null],
    ])(
      'should autofix function components to declarations (%s) %#',
      async (extension, code, expected) => {
        const { messages, output } = await fixWithKitRule(
          'function-component-definition',
          code,
          extension,
        );

        expect(output).toBe(expected ?? code);
        expect(messages).toHaveLength(expected ? 0 : 1);
      },
    );

    it.each([
      [
        'jsx',
        'export function wrap(Component) {\n  return props => <Component {...props} />;\n}',
        'export function wrap(Component) {\n  return function (props) {\n  return <Component {...props} />;\n};\n}',
      ],
      [
        'jsx',
        'export default () => <div />;',
        'export default function () {\n  return <div />;\n};',
      ],
      [
        'jsx',
        'const Foo = {};\nFoo.Bar = () => <div />;',
        'const Foo = {};\nFoo.Bar = function () {\n  return <div />;\n};',
      ],
      [
        'jsx',
        'export const hoc = C => props => <C {...props} />;',
        'export const hoc = C => function (props) {\n  return <C {...props} />;\n};',
      ],
      [
        'jsx',
        'export function guard(C) {\n  return props => {\n    if (!props.x) return null;\n    return <C />;\n  };\n}',
        'export function guard(C) {\n  return function (props) {\n    if (!props.x) return null;\n    return <C />;\n  };\n}',
      ],
      [
        'jsx',
        'export function pick(C) {\n  return props => (props.x ? <C /> : null);\n}',
        'export function pick(C) {\n  return function (props) {\n  return props.x ? <C /> : null;\n};\n}',
      ],
      [
        'jsx',
        'export function hold(C) {\n  return () => {\n    const element = <C />;\n    return element;\n  };\n}',
        'export function hold(C) {\n  return function () {\n    const element = <C />;\n    return element;\n  };\n}',
      ],
      [
        'tsx',
        'export default <T,>({ v }: { v: T }) => <div>{String(v)}</div>;',
        'export default function <T,>({ v }: { v: T }) {\n  return <div>{String(v)}</div>;\n};',
      ],
    ])(
      'should autofix unnamed arrow components to function expressions (%s) %#',
      async (extension, code, expected) => {
        const { messages, output } = await fixWithKitRule(
          'function-component-definition',
          code,
          extension,
        );

        expect(output).toBe(expected);
        expect(messages).toHaveLength(0);
      },
    );

    it.each([
      'const A = () => <div>{this.label}</div>;',
      'export function make() {\n  return () => <div>{this.label}</div>;\n}',
      'export function make() {\n  return () => <div>{arguments[0]}</div>;\n}',
      'export function make() {\n  return () => <div>{(() => this.label)()}</div>;\n}',
      'export class Box {\n  render() {\n    return () => <div>{super.toString()}</div>;\n  }\n}',
      'export function Make() {\n  return () => <div>{new.target.name}</div>;\n}',
    ])('should not autofix arrows that use lexical bindings %#', async code => {
      const { messages, output } = await fixWithKitRule('function-component-definition', code);

      expect(output).toBe(code);
      expect(messages).toHaveLength(1);
    });

    it('should autofix arrows whose `this` belongs to a nested function', async () => {
      const code =
        'export function make() {\n  return () => <div>{function () { return this; }.call(1)}</div>;\n}';
      const { messages, output } = await fixWithKitRule('function-component-definition', code);

      expect(messages).toHaveLength(0);
      expect(output).toContain('return function () {');
    });

    it.each([
      // An arrow would read the outer `this` / `arguments`
      'export function A() {\n  return <div>{this.x}</div>;\n}',
      'export function B() {\n  return <div>{arguments[0]}</div>;\n}',
      // `const C = ...` would be read before it's initialized
      'export default C;\nfunction C() {\n  return <div />;\n}',
    ])('should not autofix function components to arrows when unsafe %#', async code => {
      const { messages, output } = await fixWithKitRule(
        'function-component-definition',
        code,
        'jsx',
        {
          options: [{ namedComponents: 'arrow-function' }],
        },
      );

      expect(output).toBe(code);
      expect(messages.map(m => m.messageId)).toEqual(['arrow-function']);
    });

    it('should not autofix unnamed arrow components when a comment would be dropped', async () => {
      const code = 'export default () => (\n  // note\n  <div />\n);';
      const { messages, output } = await fixWithKitRule('function-component-definition', code);

      expect(output).toBe(code);
      expect(messages).toHaveLength(1);
    });

    it.each([
      // The wrapper call is the component, not its callback.
      "import { forwardRef, memo } from 'react';\nexport const M = memo(() => <div />);\nexport const F = forwardRef((props, ref) => <div ref={ref} />);",
      'export function List({ items }) {\n  return <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;\n}',
      'export function Table({ rows }) {\n  return <Grid renderRow={row => <span>{row}</span>} rows={rows} />;\n}',
      'export const routes = { Home: () => <div /> };',
      'const Foo = {};\nFoo.render = () => <div />;',
      'export function wrap(C) {\n  return function (props) {\n    return <C {...props} />;\n  };\n}',
      // Returns null or a value initialized to null, but never JSX.
      'export function lazy(colors) {\n  let cached = null;\n  return () => {\n    cached ??= colors.map(color => ({ id: color.id }));\n    return cached;\n  };\n}',
      'export function first(items) {\n  return () => {\n    if (!items.length) return null;\n    return items[0];\n  };\n}',
    ])('should not report unnamed functions that are not components %#', async code => {
      const { fixed, messages } = await fixWithKitRule('function-component-definition', code);

      // A fixable report would be fixed away, leaving no messages; `fixed` catches it.
      expect(fixed).toBe(false);
      expect(messages).toHaveLength(0);
    });

    it('should flag explicit boolean attribute values', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-boolean-value');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(22);
    });

    it('should flag .bind() usage in JSX props on non-DOM components', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-no-bind');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(27);
    });

    it('should flag functions and .bind() passed to component props directly or via locals', async () => {
      const code = [
        'function handleTop() {}',
        'export function Comp({ cond, onPick, x, y }) {',
        '  function handle() {}',
        '  const expression = function () {};',
        '  const arrow = () => {};',
        '  const conditional = cond ? x.bind(null) : y;',
        '  let reassigned = function () {};',
        '  return (',
        '    <>',
        '      <Widget a={handle} b={expression} c={conditional} d={x?.bind(null)} e={function () {}} />',
        '      <Widget f={arrow} g={handleTop} h={reassigned} ref={onPick.bind(null)} />',
        '      <div onClick={handle} />',
        '      <ui.Button onClick={handle} />',
        '    </>',
        '  );',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('jsx-no-bind', code);
      const functions = 'JSX props should not use functions';
      const bind = 'JSX props should not use .bind()';

      expect(messages.map(m => [m.line, m.message])).toEqual([
        [10, functions],
        [10, functions],
        [10, bind],
        [10, bind],
        [10, functions],
      ]);
    });

    it('should flag duplicate JSX props, ignoring case', async () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-no-duplicate-props');

      expect(violations.map(v => [v.line, v.severity])).toEqual([[51, 2]]);

      // Namespaced names are not checked, as in eslint-plugin-react.
      const { messages } = await fixWithKitRule(
        'jsx-no-duplicate-props',
        'const a = <div id="1" xlink:href="x" xlink:href="y" ID="2" id="3" />;',
      );

      expect(messages.map(m => [m.column, m.message])).toEqual([
        [53, 'No duplicate props allowed'],
        [60, 'No duplicate props allowed'],
      ]);
    });

    it('should flag JSX components that are not defined', async () => {
      // In JS, base's core no-undef also reports a name that isn't a global.
      expect(getViolationsForRule(result, 'no-undef').map(v => v.line)).toEqual([32]);
      expect(getViolationsForRule(result, '@gilbarbara/jsx-no-undef').map(v => v.line)).toEqual([
        32,
      ]);

      const eslint = await createESLintWithConfig(getConfigPath('index'));
      const [jsResult] = await eslint.lintText('export const App = () => <File />;\n', {
        filePath: getFixturePath('inline.jsx'),
      });

      // `File` is a Node global, so only the kit rule catches the missing import.
      expect(getViolationsForRule(jsResult, 'no-undef')).toHaveLength(0);
      expect(getViolationsForRule(jsResult, '@gilbarbara/jsx-no-undef')).toHaveLength(1);

      const [tsResult] = await eslint.lintText('export const App = () => <Missing />;\n', {
        filePath: getFixturePath('inline.tsx'),
      });
      const violations = getViolationsForRule(tsResult, '@gilbarbara/jsx-no-undef');

      expect(violations.map(v => [v.line, v.severity])).toEqual([[1, 2]]);
    });

    it('should resolve TSX components from imports and local scopes', async () => {
      const code = [
        "import Card from './card';",
        "import * as UI from './ui';",
        'function Local() {',
        '  return <div />;',
        '}',
        'export class Page {',
        '  Inner = Local;',
        '  render() {',
        '    return <><Card /><UI.Button /><Local /><this.Inner /><svg:rect /><Missing.Item /><Gone /></>;',
        '  }',
        '}',
      ].join('\n');
      const { messages } = await fixWithKitRule('jsx-no-undef', code, 'tsx');

      expect(messages.map(m => m.message)).toEqual([
        "'Missing' is not defined.",
        "'Gone' is not defined.",
      ]);
    });

    it('should not report variables or imports used only in JSX as unused', async () => {
      expect(getViolationsForRule(result, 'no-unused-vars')).toHaveLength(0);
      expect(getViolationsForRule(result, 'unused-imports/no-unused-vars')).toHaveLength(0);

      const eslint = await createESLintWithConfig(getConfigPath('index'));
      const [jsxResult] = await eslint.lintText(
        "import Card from './card';\n\nexport const App = () => <Card />;\n",
        { filePath: getFixturePath('inline.jsx') },
      );

      expect(getViolationsForRule(jsxResult, 'no-unused-vars')).toHaveLength(0);
      expect(getViolationsForRule(jsxResult, 'unused-imports/no-unused-imports')).toHaveLength(0);
    });

    it('should apply the JSX style rules that replaced react/*', () => {
      const lines = rule => getViolationsForRule(result, rule).map(v => [v.line, v.severity]);

      expect(lines('@stylistic/jsx-self-closing-comp')).toEqual([[41, 2]]);
      expect(lines('@stylistic/jsx-curly-brace-presence')).toEqual([[42, 2]]);
      expect(lines('@stylistic/jsx-pascal-case')).toEqual([[43, 2]]);
      expect(lines('perfectionist/sort-jsx-props')).toEqual([[44, 1]]);
    });

    it('should sort JSX props naturally with reserved props first', async () => {
      const { default: perfectionist } = await import('eslint-plugin-perfectionist');
      const { default: reactRules } = await import(getConfigPath('rules/react'));
      const linter = new Linter({ configType: 'flat' });
      const config = [
        {
          files: ['**/*.jsx'],
          languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
          plugins: { perfectionist },
          rules: { 'perfectionist/sort-jsx-props': reactRules['perfectionist/sort-jsx-props'] },
        },
      ];
      const { output } = linter.verifyAndFix(
        'const a = <Widget zeta="1" Alpha="2" key="k" item10="a" ref={r} item2="b" />;',
        config,
        'component.jsx',
      );

      expect(output).toBe(
        'const a = <Widget key="k" ref={r} Alpha="2" item2="b" item10="a" zeta="1" />;',
      );
    });
  });

  describe('Combined Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('index'));
    });

    it('should apply both base and React rules', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const allViolations = getAllViolations(result);

      const hasBaseViolations = allViolations.some(v =>
        ['no-console', 'perfectionist/sort-imports'].includes(v.ruleId),
      );
      const hasReactViolations = allViolations.some(v => v.ruleId && v.ruleId.startsWith('react'));

      expect(hasBaseViolations || hasReactViolations).toBe(true);
    });
  });

  describe('Node.js Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      const baseModule = await import(getConfigPath('base'));
      const nodeModule = await import(getConfigPath('node'));

      const combinedConfig = [...baseModule.default, ...nodeModule.default];

      eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: combinedConfig,
        ignore: false,
      });
    });

    it('should detect deprecated Node.js APIs', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const deprecatedViolations = getViolationsForRule(result, 'n/no-deprecated-api');

      expect(deprecatedViolations.length).toBeGreaterThan(0);
    });

    it('should detect path concatenation issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const pathViolations = getViolationsForRule(result, 'n/no-path-concat');

      expect(pathViolations.length).toBeGreaterThan(0);
    });

    it('should suggest node: protocol', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const protocolViolations = getViolationsForRule(result, 'n/prefer-node-protocol');

      expect(protocolViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Testing Configuration Integration', () => {
    it('should detect focused tests in Vitest files', async () => {
      const baseModule = await import(getConfigPath('base'));
      const vitestModule = await import(getConfigPath('vitest'));

      const combinedConfig = [...baseModule.default, ...vitestModule.default];

      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: combinedConfig,
        ignore: false,
      });

      const result = await lintFile(eslint, getFixturePath('sample-test.js'));
      const focusedTestViolations = getViolationsForRule(result, 'vitest/no-focused-tests');

      expect(focusedTestViolations).toHaveLength(1);
      expect(focusedTestViolations[0].severity).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const eslint = await createESLintWithConfig(getConfigPath('base'));

      await expect(lintFile(eslint, getFixturePath('non-existent.js'))).rejects.toThrow();
    });

    it('should handle syntax errors in files', async () => {
      const tempFile = getFixturePath('syntax-error.js');
      const fs = await import('node:fs/promises');

      try {
        await fs.writeFile(tempFile, 'const invalid syntax = ;');

        const eslint = await createESLintWithConfig(getConfigPath('base'));
        const result = await lintFile(eslint, tempFile);

        expect(result.errorCount).toBeGreaterThan(0);
      } finally {
        try {
          await fs.unlink(tempFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});
