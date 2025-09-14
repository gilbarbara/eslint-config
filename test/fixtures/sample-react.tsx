import React from 'react';
import PropTypes from 'prop-types';

// Test React component with TypeScript
interface Props {
  title: string;
  count?: number;
  onClick: () => void;
}

// Test React hooks rules
function TestComponent({ title, count = 0, onClick }: Props) {
  const [state, setState] = React.useState(0);

  // Test missing dependency in useEffect
  React.useEffect(() => {
    console.log(state);
  }, []); // Should warn about missing dependency

  // Test JSX accessibility
  return (
    <div>
      {/* Should warn about missing alt text */}
      <img src="test.jpg" />
      
      {/* Should warn about click handler on non-interactive element */}
      <div onClick={onClick}>
        <h1>{title}</h1>
        <button type="button" onClick={onClick}>
          Count: {count}
        </button>
      </div>
    </div>
  );
}

// Test prop-types (should be disabled for TypeScript)
TestComponent.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  onClick: PropTypes.func.isRequired,
};

export default TestComponent;