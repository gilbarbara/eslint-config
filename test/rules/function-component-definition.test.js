import { rules, ruleTester, tsx } from '../utils/rule-tester.js';

const arrows = [{ namedComponents: 'arrow-function' }];
const declaration = { messageId: 'function-declaration' };
const expression = { messageId: 'function-expression' };
const arrow = { messageId: 'arrow-function' };

ruleTester.run('function-component-definition', rules['function-component-definition'], {
  valid: [
    'export function C() {\n  return <div />;\n}',
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
    {
      code: 'export const C = () => <div />;\nexport function D() {\n  return <div />;\n}',
      options: [{ namedComponents: ['function-declaration', 'arrow-function'] }],
    },
  ],
  invalid: [
    // Named components → function declaration (default)
    {
      code: 'export const A = () => <div />;',
      errors: [declaration],
      output: 'export function A() {\n  return <div />;\n}',
    },
    {
      code: 'const B = async ({ a }) => {\n  return <div>{a}</div>;\n};',
      errors: [declaration],
      output: 'async function B({ a }) {\n  return <div>{a}</div>;\n}',
    },
    {
      code: 'const C = <T,>({ v }: { v: T }): JSX.Element => <div>{String(v)}</div>;',
      errors: [declaration],
      output: 'function C<T,>({ v }: { v: T }): JSX.Element {\n  return <div>{String(v)}</div>;\n}',
      ...tsx,
    },
    // JSX that looks like a template slot is user code, not a slot.
    {
      code: 'export const C = () => <div>{name}{params}{body}{varType}{typeAnnotation}</div>;',
      errors: [declaration],
      output:
        'export function C() {\n  return <div>{name}{params}{body}{varType}{typeAnnotation}</div>;\n}',
    },
    // Not fixed: named function expression, multiple declarators, typed variable, comments
    {
      code: 'const D = function Inner() {\n  return <div />;\n};',
      errors: [declaration],
      output: null,
    },
    { code: 'const E = () => <div />,\n  f = 1;', errors: [declaration], output: null },
    { code: 'const G: FC = () => <div />;', errors: [declaration], output: null, ...tsx },
    { code: 'const H = () => (\n  // note\n  <div />\n);', errors: [declaration], output: null },
    { code: 'const I = /* note */ () => <div />;', errors: [declaration], output: null },
    // Not fixed: a declaration can't sit in a `for` header; a block-local `var` reaches the function
    {
      code: 'for (const C = () => <div />; go(); ) {\n  use(C);\n}',
      errors: [declaration],
      output: null,
    },
    {
      code: 'export function f(x) {\n  if (x) {\n    var C = () => <div />;\n  }\n  return C;\n}',
      errors: [declaration],
      output: null,
    },
    // Not fixed: an arrow's `this`, `arguments`, `super` and `new.target` belong to the outer scope
    { code: 'const A = () => <div>{this.label}</div>;', errors: [declaration], output: null },

    // Unnamed components → function expression (default)
    {
      code: 'export function wrap(Component) {\n  return props => <Component {...props} />;\n}',
      errors: [expression],
      output:
        'export function wrap(Component) {\n  return function (props) {\n  return <Component {...props} />;\n};\n}',
    },
    {
      code: 'export default () => <div />;',
      errors: [expression],
      output: 'export default function () {\n  return <div />;\n};',
    },
    {
      code: 'export default ({ name }) => <div>{name}</div>;',
      errors: [expression],
      output: 'export default function ({ name }) {\n  return <div>{name}</div>;\n};',
    },
    {
      code: 'const Foo = {};\nFoo.Bar = () => <div />;',
      errors: [expression],
      output: 'const Foo = {};\nFoo.Bar = function () {\n  return <div />;\n};',
    },
    {
      code: 'export const hoc = C => props => <C {...props} />;',
      errors: [expression],
      output: 'export const hoc = C => function (props) {\n  return <C {...props} />;\n};',
    },
    {
      code: 'export function guard(C) {\n  return props => {\n    if (!props.x) return null;\n    return <C />;\n  };\n}',
      errors: [expression],
      output:
        'export function guard(C) {\n  return function (props) {\n    if (!props.x) return null;\n    return <C />;\n  };\n}',
    },
    {
      code: 'export function pick(C) {\n  return props => (props.x ? <C /> : null);\n}',
      errors: [expression],
      output:
        'export function pick(C) {\n  return function (props) {\n  return props.x ? <C /> : null;\n};\n}',
    },
    {
      code: 'export function hold(C) {\n  return () => {\n    const element = <C />;\n    return element;\n  };\n}',
      errors: [expression],
      output:
        'export function hold(C) {\n  return function () {\n    const element = <C />;\n    return element;\n  };\n}',
    },
    {
      code: 'export default <T,>({ v }: { v: T }) => <div>{String(v)}</div>;',
      errors: [expression],
      output:
        'export default function <T,>({ v }: { v: T }) {\n  return <div>{String(v)}</div>;\n};',
      ...tsx,
    },
    {
      code: 'export function make() {\n  return () => <div>{function () { return this; }.call(1)}</div>;\n}',
      errors: [expression],
      output:
        'export function make() {\n  return function () {\n  return <div>{function () { return this; }.call(1)}</div>;\n};\n}',
    },
    ...[
      'export function make() {\n  return () => <div>{this.label}</div>;\n}',
      'export function make() {\n  return () => <div>{arguments[0]}</div>;\n}',
      'export function make() {\n  return () => <div>{(() => this.label)()}</div>;\n}',
      'export class Box {\n  render() {\n    return () => <div>{super.toString()}</div>;\n  }\n}',
      'export function Make() {\n  return () => <div>{new.target.name}</div>;\n}',
      'export default () => (\n  // note\n  <div />\n);',
    ].map(code => ({ code, errors: [expression], output: null })),

    // Other styles
    {
      code: 'export function C() {\n  return <div />;\n}',
      errors: [arrow],
      options: arrows,
      output: 'export const C = () => {\n  return <div />;\n};',
    },
    {
      code: 'export const C = () => <div />;',
      errors: [expression],
      options: [{ namedComponents: 'function-expression' }],
      output: 'export const C = function () {\n  return <div />;\n};',
    },
    // The generated statement is terminated, so the next one stays separate.
    {
      code: 'export const C = () => <div />; const n = 1;',
      errors: [expression],
      options: [{ namedComponents: 'function-expression' }],
      output: 'export const C = function () {\n  return <div />;\n}; const n = 1;',
    },
    {
      code: 'export function C() {\n  return <div />;\n}\n(function init() {})();',
      errors: [arrow],
      options: arrows,
      output: 'export const C = () => {\n  return <div />;\n};\n(function init() {})();',
    },
    {
      code: 'export function wrap(C) {\n  return function (props) {\n    return <C {...props} />;\n  };\n}',
      errors: [arrow],
      options: [{ unnamedComponents: 'arrow-function' }],
      output:
        'export function wrap(C) {\n  return (props) => {\n    return <C {...props} />;\n  };\n}',
    },
    // Not fixed: an arrow would read the outer `this`/`arguments`; `const C` would be read early
    ...[
      'export function A() {\n  return <div>{this.x}</div>;\n}',
      'export function B() {\n  return <div>{arguments[0]}</div>;\n}',
      'export default C;\nfunction C() {\n  return <div />;\n}',
      'export function* C() {\n  return <div />;\n}',
      // `const C` can't be reassigned.
      'function C() {\n  return <div />;\n}\nC = wrap(C);\nexport { C };',
    ].map(code => ({ code, errors: [arrow], options: arrows, output: null })),
    // Not fixed: an arrow can't take a TS `this` param; overloads would lose their implementation;
    // in TSX `<T>() =>` parses as JSX
    ...[
      'export function C<T>({ v }: { v: T }) {\n  return <div>{String(v)}</div>;\n}',
      'export function C(this: Window, { a }: P) {\n  return <div>{a}</div>;\n}',
      'export function C(p: A): JSX.Element;\nexport function C(p: B): JSX.Element;\nexport function C(p: A | B) {\n  return <div />;\n}',
    ].map(code => ({ code, errors: [arrow], options: arrows, output: null, ...tsx })),
    {
      code: 'function C(p: A): JSX.Element;\nfunction C(p: B): JSX.Element;\nfunction C(p: A | B) {\n  return <div />;\n}',
      errors: [expression],
      options: [{ namedComponents: 'function-expression' }],
      output: null,
      ...tsx,
    },
  ],
});
