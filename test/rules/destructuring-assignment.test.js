import { rules, ruleTester, tsx } from '../utils/rule-tester.js';

const signature = ['always', { destructureInSignature: 'always' }];
const useDestruct = type => ({ data: { type }, messageId: 'useDestructAssignment' });

ruleTester.run('destructuring-assignment', rules['destructuring-assignment'], {
  valid: [
    'export function C({ a }) {\n  return <div>{a}</div>;\n}',
    // Optional reads and writes
    'export function C(props) {\n  props.a = 1;\n  return <div>{props?.b}</div>;\n}',
    // Not a component class
    'export class C extends Store {\n  read() {\n    return this.props.a;\n  }\n}',
    // Unnamed functions that don't return JSX
    'export function makeFinder(items) {\n  return options => {\n    if (!options.id) return null;\n    return items.find(item => item.id === options.id);\n  };\n}',
    'export function makeGetter(source) {\n  let cached = null;\n  return options => {\n    cached ??= source.load(options.key);\n    return cached;\n  };\n}',
    { code: 'export function C(props) {\n  return <div>{props.a}</div>;\n}', options: ['never'] },
    {
      code: "import { Component } from 'react';\nexport class C extends Component {\n  label = this.props.label;\n  render() {\n    return <div />;\n  }\n}",
      options: ['always', { ignoreClassFields: true }],
    },
    // A computed key isn't `this.props`.
    "import { Component } from 'react';\nexport class C extends Component {\n  render() {\n    const props = 'cache';\n    return <div>{this[props].title}</div>;\n  }\n}",
    // props used elsewhere: destructuring stays in the body
    {
      code: 'export function C(props) {\n  const { a } = props;\n  return <div {...props}>{a}</div>;\n}',
      options: signature,
    },
  ],
  invalid: [
    {
      code: 'export function C(props) {\n  return <div>{props.a}</div>;\n}',
      errors: [useDestruct('props')],
    },
    {
      code: "import React, { PureComponent } from 'react';\nexport class A extends React.Component {\n  render() {\n    this.state.x = 1;\n    return <div>{this.props.a}{this.state.b}{this.context.c}</div>;\n  }\n}\nexport class B extends PureComponent {\n  render() {\n    return <div>{this.props.a}</div>;\n  }\n}",
      errors: [
        { ...useDestruct('props'), line: 5 },
        { ...useDestruct('state'), line: 5 },
        { ...useDestruct('context'), line: 5 },
        { ...useDestruct('props'), line: 10 },
      ],
    },
    {
      code: 'export function C(props, context) {\n  return <div>{context.c}</div>;\n}',
      errors: [useDestruct('context')],
    },
    {
      code: 'export function View(props = {}) {\n  return <div>{props.title}</div>;\n}',
      errors: [useDestruct('props')],
    },
    {
      code: "import { Component as Base } from 'react';\nexport class Aliased extends Base {\n  render() {\n    return <div>{this.props.title}</div>;\n  }\n}",
      errors: [useDestruct('props')],
    },
    {
      code: 'export function wrap(C) {\n  return props => <C label={props.label} />;\n}',
      errors: [useDestruct('props')],
    },
    {
      code: "import { Component } from 'react';\nexport class C extends Component {\n  label = this.props.label;\n  render() {\n    return <div />;\n  }\n}",
      errors: [useDestruct('props')],
    },
    {
      code: 'export function C({ a }) {\n  return <div>{a}</div>;\n}',
      errors: [{ messageId: 'noDestructPropsInSFCArg' }],
      options: ['never'],
    },
    {
      code: 'export function C(props, { theme }) {\n  return <div>{props.a}{theme}</div>;\n}',
      errors: [{ messageId: 'noDestructContextInSFCArg' }],
      options: ['never'],
    },
    {
      code: 'export function C(props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
      errors: [{ data: { type: 'props' }, messageId: 'noDestructAssignment' }],
      options: ['never'],
    },
    {
      code: "import { Component } from 'react';\nexport class C extends Component {\n  render() {\n    const { a } = this.props;\n    return <div>{a}</div>;\n  }\n}",
      errors: [{ data: { type: 'props' }, messageId: 'noDestructAssignment' }],
      options: ['never'],
    },
    {
      code: 'export function C(props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: 'export function C({ a }) {\n  \n  return <div>{a}</div>;\n}',
    },
    // A bare arrow param needs parentheses once it's a pattern.
    {
      code: 'export const C = props => {\n  const { a } = props;\n  return <div>{a}</div>;\n};',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: 'export const C = ({ a }) => {\n  \n  return <div>{a}</div>;\n};',
    },
    // Defaults and computed keys may read body locals, which don't exist at parameter time.
    {
      code: "export function C(props) {\n  const fallback = 'x';\n  const { a = fallback } = props;\n  return <div>{a}</div>;\n}",
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
    {
      code: "export function C(props) {\n  const key = 'k';\n  const { [key]: a } = props;\n  return <div>{a}</div>;\n}",
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
    {
      code: 'export function C(props) {\n  const { a: { b = 1 } } = props;\n  return <div>{b}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
    // Not fixed: the fix rewrites the first param, which isn't `props` here.
    {
      code: 'export function C(ref, props) {\n  const { a } = props;\n  return <div ref={ref}>{a}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
    // The pattern's type annotation moves with it; with one on the param too, it's not fixed.
    {
      code: 'export const C = (props) => {\n  const { a }: Props = props;\n  return <div>{a}</div>;\n};',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: 'export const C = ({ a }: Props) => {\n  \n  return <div>{a}</div>;\n};',
      ...tsx,
    },
    {
      code: 'export const C = (props: Props) => {\n  const { a }: Props = props;\n  return <div>{a}</div>;\n};',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
      ...tsx,
    },
    // Not fixed: `'use strict'` forbids a destructured param.
    {
      code: "export function C(props) {\n  'use strict';\n  const { a } = props;\n  return <div>{a}</div>;\n}",
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
    // Not fixed: the comment would be removed with the declaration or the param.
    ...[
      'export function C(props) {\n  const /* why */ { a } = props;\n  return <div>{a}</div>;\n}',
      'export function C(props) {\n  const { a } = /* why */ props;\n  return <div>{a}</div>;\n}',
    ].map(code => ({
      code,
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    })),
    {
      code: 'export function C(props /* why */: Props) {\n  const { a } = props;\n  return <div>{a}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
      ...tsx,
    },
    // A comment in the kept pattern or param type moves with it.
    {
      code: 'export function C(props: /* why */ Props) {\n  const { /* a */ a } = props;\n  return <div>{a}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output:
        'export function C({ /* a */ a }: /* why */ Props) {\n  \n  return <div>{a}</div>;\n}',
      ...tsx,
    },
    // Removing the declaration would drop the other declarator.
    {
      code: 'export function C(props) {\n  const { a } = props, b = load();\n  return <div>{a}{b}</div>;\n}',
      errors: [{ messageId: 'destructureInSignature' }],
      options: signature,
      output: null,
    },
  ],
});
