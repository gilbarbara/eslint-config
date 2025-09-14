import React from 'react';
import PropTypes from 'prop-types';

// Test React component with JavaScript (prop-types should be required)
function JSTestComponent({ title, count, onClick }) {
  const [state, setState] = React.useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <button type="button" onClick={onClick}>
        Count: {count}
      </button>
    </div>
  );
}

// Missing prop-types should trigger warning for JS files
export default JSTestComponent;