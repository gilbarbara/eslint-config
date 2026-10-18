import { describe, expect, it } from 'vitest';

import { fixWithKitRule } from '../utils/helpers.js';

// The @gilbarbara/* rules take eslint-plugin-react's options, with its defaults.

const lint = async (rule, code, options, extension = 'jsx') => {
  const { messages, output } = await fixWithKitRule(rule, code, extension, { options });

  return { ids: messages.map(m => m.messageId), output };
};

describe('@gilbarbara/* rule options', () => {
  describe('destructuring-assignment', () => {
    it.each([
      // Default: 'always'
      [
        [],
        'export function C(props) {\n  return <div>{props.a}</div>;\n}',
        ['useDestructAssignment'],
      ],
      [
        ['never'],
        'export function C({ a }) {\n  return <div>{a}</div>;\n}',
        ['noDestructPropsInSFCArg'],
      ],
      [
        ['never'],
        'export function C(props, { theme }) {\n  return <div>{props.a}{theme}</div>;\n}',
        ['noDestructContextInSFCArg'],
      ],
      [
        ['never'],
        'export function C(props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
        ['noDestructAssignment'],
      ],
      [
        ['never'],
        "import { Component } from 'react';\nexport class C extends Component {\n  render() {\n    const { a } = this.props;\n    return <div>{a}</div>;\n  }\n}",
        ['noDestructAssignment'],
      ],
      [['never'], 'export function C(props) {\n  return <div>{props.a}</div>;\n}', []],
    ])('should apply %j', async (options, code, expected) => {
      const { ids } = await lint('destructuring-assignment', code, options);

      expect(ids).toEqual(expected);
    });

    it.each([
      [[], ['useDestructAssignment']],
      [['always', { ignoreClassFields: true }], []],
    ])('should apply %j to class fields', async (options, expected) => {
      const code =
        "import { Component } from 'react';\nexport class C extends Component {\n  label = this.props.label;\n  render() {\n    return <div />;\n  }\n}";

      const { ids } = await lint('destructuring-assignment', code, options);

      expect(ids).toEqual(expected);
    });

    it('should move destructuring into the signature with destructureInSignature', async () => {
      const { ids, output } = await lint(
        'destructuring-assignment',
        'export function C(props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
        ['always', { destructureInSignature: 'always' }],
      );

      expect(ids).toEqual([]);
      expect(output).toBe('export function C({ a }) {\n  \n  return <div>{a}</div>;\n}');
    });

    it('should keep the signature when props is used elsewhere', async () => {
      const code =
        'export function C(props) {\n  const { a } = props;\n  return <div {...props}>{a}</div>;\n}';
      const { ids, output } = await lint('destructuring-assignment', code, [
        'always',
        { destructureInSignature: 'always' },
      ]);

      expect(ids).toEqual([]);
      expect(output).toBe(code);
    });
  });

  describe('function-component-definition', () => {
    it.each([
      // Default: named function-declaration
      [[], 'export const C = () => <div />;', 'export function C() {\n  return <div />;\n}'],
      [
        [{ namedComponents: 'arrow-function' }],
        'export function C() {\n  return <div />;\n}',
        'export const C = () => {\n  return <div />;\n}',
      ],
      [
        [{ namedComponents: 'function-expression' }],
        'export const C = () => <div />;',
        'export const C = function () {\n  return <div />;\n}',
      ],
      [
        [{ unnamedComponents: 'arrow-function' }],
        'export function wrap(C) {\n  return function (props) {\n    return <C {...props} />;\n  };\n}',
        'export function wrap(C) {\n  return (props) => {\n    return <C {...props} />;\n  };\n}',
      ],
    ])('should apply %j', async (options, code, expected) => {
      const { ids, output } = await lint('function-component-definition', code, options);

      expect(ids).toEqual([]);
      expect(output).toBe(expected);
    });

    it('should accept any style listed in an array', async () => {
      const { ids } = await lint(
        'function-component-definition',
        'export const C = () => <div />;\nexport function D() {\n  return <div />;\n}',
        [{ namedComponents: ['function-declaration', 'arrow-function'] }],
      );

      expect(ids).toEqual([]);
    });
  });

  describe('jsx-boolean-value', () => {
    it.each([
      // Default: 'never'
      [[], '<App foo={true} />', '<App foo />', []],
      [['always'], '<App foo />', '<App foo={true} />', []],
      [['never', { always: ['foo'] }], '<App foo bar={true} />', '<App foo={true} bar />', []],
      [['always', { never: ['foo'] }], '<App foo={true} bar />', '<App foo bar={true} />', []],
      [['never', { assumeUndefinedIsFalse: true }], '<App foo={false} />', '<App  />', []],
      [['never'], '<App foo={false} />', '<App foo={false} />', []],
    ])('should apply %j to %s', async (options, code, expected, remaining) => {
      const { ids, output } = await lint('jsx-boolean-value', `export const a = ${code};`, options);

      expect(output).toBe(`export const a = ${expected};`);
      expect(ids).toEqual(remaining);
    });
  });

  describe('jsx-no-bind', () => {
    const wrap = element => `export function C({ onPick }) {\n  return ${element};\n}`;

    it.each([
      // Defaults: everything is reported
      [[], '<App onClick={() => onPick()} />', ['arrowFunc']],
      [[], '<App onClick={onPick.bind(null)} />', ['bindCall']],
      [[], '<App onClick={function () {}} />', ['func']],
      [[], '<App ref={onPick.bind(null)} />', ['bindCall']],
      [[], '<div onClick={() => onPick()} />', ['arrowFunc']],
      [[{ allowArrowFunctions: true }], '<App onClick={() => onPick()} />', []],
      [[{ allowBind: true }], '<App onClick={onPick.bind(null)} />', []],
      [[{ allowFunctions: true }], '<App onClick={function () {}} />', []],
      [[{ ignoreRefs: true }], '<App ref={onPick.bind(null)} />', []],
      [[{ ignoreDOMComponents: true }], '<div onClick={() => onPick()} />', []],
    ])('should apply %j to %s', async (options, element, expected) => {
      const { ids } = await lint('jsx-no-bind', wrap(element), options);

      expect(ids).toEqual(expected);
    });
  });

  describe('jsx-no-duplicate-props', () => {
    it.each([
      // Default: case-sensitive
      [[], '<App a="1" A="2" />', []],
      [[], '<App a="1" a="2" />', ['noDuplicateProps']],
      [[{ ignoreCase: true }], '<App a="1" A="2" />', ['noDuplicateProps']],
    ])('should apply %j to %s', async (options, element, expected) => {
      const { ids } = await lint('jsx-no-duplicate-props', `export const a = ${element};`, options);

      expect(ids).toEqual(expected);
    });
  });

  describe('jsx-no-undef', () => {
    it.each([
      [undefined, 1],
      [[{ allowGlobals: false }], 1],
      [[{ allowGlobals: true }], 0],
    ])('should apply %j to configured globals', async (options, count) => {
      const { messages } = await fixWithKitRule(
        'jsx-no-undef',
        'export const a = <Widget />;',
        'tsx',
        {
          languageOptions: { globals: { Widget: 'readonly' } },
          options,
        },
      );

      expect(messages).toHaveLength(count);
    });
  });

  it('should reject unknown options', async () => {
    await expect(
      fixWithKitRule('jsx-no-undef', 'export const a = <Widget />;', 'jsx', {
        options: [{ allow: true }],
      }),
    ).rejects.toThrow(/should NOT have additional properties/);
  });
});
