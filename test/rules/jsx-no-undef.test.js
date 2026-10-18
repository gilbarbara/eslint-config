import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

import { rules, ruleTester, tsx } from '../utils/rule-tester.js';

const undef = name => ({ data: { name }, messageId: 'undefined' });
const widgetGlobal = {
  languageOptions: { ...tsx.languageOptions, globals: { Widget: 'readonly' } },
};

ruleTester.run('jsx-no-undef', rules['jsx-no-undef'], {
  valid: [
    "import Card from './card';\nexport const a = <Card />;",
    'export const a = <div />;',
    {
      code: 'export const a = <Widget />;',
      options: [{ allowGlobals: true }],
      ...tsx,
      ...widgetGlobal,
    },
  ],
  invalid: [
    { code: 'export const a = <Missing />;', errors: [undef('Missing')] },
    // A configured global isn't an import.
    { code: 'export const a = <Widget />;', errors: [undef('Widget')], ...tsx, ...widgetGlobal },
    {
      code: 'export const a = <Widget />;',
      errors: [undef('Widget')],
      options: [{ allowGlobals: false }],
      ...tsx,
      ...widgetGlobal,
    },
    {
      code: [
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
      ].join('\n'),
      errors: [undef('Missing'), undef('Gone')],
      ...tsx,
    },
  ],
});

describe('jsx-no-undef options', () => {
  it('should reject unknown options', () => {
    const linter = new Linter({ configType: 'flat' });

    expect(() =>
      linter.verify('export const a = 1;', [
        {
          plugins: { '@gilbarbara': { rules } },
          rules: { '@gilbarbara/jsx-no-undef': ['error', { allow: true }] },
        },
      ]),
    ).toThrow(/should NOT have additional properties/);
  });
});
