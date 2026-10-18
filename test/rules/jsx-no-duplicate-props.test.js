import { rules, ruleTester } from '../utils/rule-tester.js';

const duplicate = { messageId: 'noDuplicateProps' };

ruleTester.run('jsx-no-duplicate-props', rules['jsx-no-duplicate-props'], {
  valid: [
    'export const a = <App a="1" A="2" />;',
    'export const a = <App a="1" {...rest} b="2" />;',
    // Namespaced names are not checked, as in eslint-plugin-react.
    'export const a = <svg xlink:href="x" xlink:href="y" />;',
  ],
  invalid: [
    { code: 'export const a = <App a="1" a="2" />;', errors: [duplicate] },
    {
      code: 'export const a = <App a="1" A="2" />;',
      errors: [duplicate],
      options: [{ ignoreCase: true }],
    },
    {
      code: 'const a = <div id="1" xlink:href="x" xlink:href="y" ID="2" id="3" />;',
      errors: [
        { ...duplicate, column: 53 },
        { ...duplicate, column: 60 },
      ],
      options: [{ ignoreCase: true }],
    },
  ],
});
