// Cases for the rules that replaced eslint-plugin-react rules. Each must keep reporting at
// the line the replaced rule did; the integration tests assert these line numbers, so
// append new cases at the end.

// Custom component for the @gilbarbara/jsx-no-bind case (DOM components are ignored)
function Widget(props) {
  return <button type="button">{props.label}</button>;
}

// @gilbarbara/function-component-definition: named component as arrow (want function declaration)
export const ArrowComponent = () => {
  return <div>arrow</div>;
};

// @gilbarbara/destructuring-assignment: reads props.* instead of destructuring
export function PropsComponent(props) {
  return <div>{props.title}</div>;
}

// @gilbarbara/jsx-boolean-value: explicit `={true}` should use shorthand
export function BooleanValue() {
  return <Widget disabled={true} label="x" />;
}

// @gilbarbara/jsx-no-bind: `.bind()` on a non-DOM component prop
export function NoBind({ onSelect }) {
  return <Widget label="y" onClick={onSelect.bind(null)} />;
}

// no-undef: component is neither imported nor declared
export function Undefined() {
  return <Missing />;
}

const Bad_Name = Widget;

// @stylistic/jsx-* and perfectionist/sort-jsx-props cases
export function Stylistic() {
  return (
    <>
      <Widget label="a"></Widget>
      <Widget label={'b'} />
      <Bad_Name label="c" />
      <Widget label="d" disabled />
    </>
  );
}

// @gilbarbara/jsx-no-duplicate-props: names compare case-insensitively across spreads
export function DuplicateProps({ rest }) {
  return <Widget label="a" {...rest} Label="b" />;
}
