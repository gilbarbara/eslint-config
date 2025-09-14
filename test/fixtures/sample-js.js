/* eslint-disable no-unused-vars */

// Test import ordering
import z from 'z';
import a from 'a';

// Test unused variable
const unusedVariable = 'test';

// Test sorting destructuring keys
const { z: destructuredZ, a: destructuredA } = { a: 1, z: 2 };

// Test function spacing and formatting
function badlyFormattedFunction( ){
  const object={
    key:'value'
  };
  return object;
}
