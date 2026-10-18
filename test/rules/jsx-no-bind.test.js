import { configOptions, rules, ruleTester } from '../utils/rule-tester.js';

const inComponent = element => `export function C({ onPick }) {\n  return ${element};\n}`;
const config = configOptions('jsx-no-bind');

ruleTester.run('jsx-no-bind', rules['jsx-no-bind'], {
  valid: [
    {
      code: inComponent('<App onClick={() => onPick()} />'),
      options: [{ allowArrowFunctions: true }],
    },
    { code: inComponent('<App onClick={onPick.bind(null)} />'), options: [{ allowBind: true }] },
    { code: inComponent('<App onClick={function () {}} />'), options: [{ allowFunctions: true }] },
    { code: inComponent('<App ref={onPick.bind(null)} />'), options: [{ ignoreRefs: true }] },
    {
      code: inComponent('<div onClick={() => onPick()} />'),
      options: [{ ignoreDOMComponents: true }],
    },
    // `factory[bind]` calls whatever `bind` holds; a destructured name isn't the initializer.
    "export function C({ factory }) {\n  const bind = 'create';\n  return <App onClick={factory[bind]()} />;\n}",
    'export function C({ foo }) {\n  const { x } = foo.bind(null);\n  return <App onClick={x} />;\n}',
  ],
  invalid: [
    // Defaults: everything is reported, DOM components and refs included.
    { code: inComponent('<App onClick={() => onPick()} />'), errors: [{ messageId: 'arrowFunc' }] },
    {
      code: inComponent('<App onClick={onPick.bind(null)} />'),
      errors: [{ messageId: 'bindCall' }],
    },
    { code: inComponent('<App onClick={function () {}} />'), errors: [{ messageId: 'func' }] },
    {
      code: inComponent("<App onClick={onPick['bind'](null)} />"),
      errors: [{ messageId: 'bindCall' }],
    },
    { code: inComponent('<App ref={onPick.bind(null)} />'), errors: [{ messageId: 'bindCall' }] },
    { code: inComponent('<div onClick={() => onPick()} />'), errors: [{ messageId: 'arrowFunc' }] },
    // This config: arrows, refs and DOM components are allowed; locals are traced.
    {
      code: [
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
      ].join('\n'),
      errors: [
        { line: 10, messageId: 'func' },
        { line: 10, messageId: 'func' },
        { line: 10, messageId: 'bindCall' },
        { line: 10, messageId: 'bindCall' },
        { line: 10, messageId: 'func' },
      ],
      options: config,
    },
  ],
});
