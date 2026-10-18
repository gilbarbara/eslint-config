import { rules, ruleTester } from '../utils/rule-tester.js';

const omit = propName => ({ data: { propName }, messageId: 'omitBoolean' });
const set = propName => ({ data: { propName }, messageId: 'setBoolean' });

ruleTester.run('jsx-boolean-value', rules['jsx-boolean-value'], {
  valid: [
    'export const a = <App foo />;',
    'export const a = <App foo={false} />;',
    { code: 'export const a = <App foo={true} />;', options: ['always'] },
    { code: 'export const a = <App foo bar={true} />;', options: ['never', { always: ['bar'] }] },
  ],
  invalid: [
    {
      code: 'export const a = <App foo={true} />;',
      errors: [omit('foo')],
      output: 'export const a = <App foo />;',
    },
    {
      code: 'export const a = <App foo={true}>{name}</App>;',
      errors: [omit('foo')],
      output: 'export const a = <App foo>{name}</App>;',
    },
    {
      code: 'export const a = <App foo />;',
      errors: [set('foo')],
      options: ['always'],
      output: 'export const a = <App foo={true} />;',
    },
    {
      code: 'export const a = <App foo bar={true} />;',
      errors: [set('foo'), omit('bar')],
      options: ['never', { always: ['foo'] }],
      output: 'export const a = <App foo={true} bar />;',
    },
    {
      code: 'export const a = <App foo={true} bar />;',
      errors: [omit('foo'), set('bar')],
      options: ['always', { never: ['foo'] }],
      output: 'export const a = <App foo bar={true} />;',
    },
    {
      code: 'export const a = <App foo={false} />;',
      errors: [{ data: { propName: 'foo' }, messageId: 'omitPropAndBoolean' }],
      options: ['never', { assumeUndefinedIsFalse: true }],
      output: 'export const a = <App  />;',
    },
    // A comment in the value would be removed with it.
    { code: 'export const a = <App foo={/* why */ true} />;', errors: [omit('foo')], output: null },
  ],
});
