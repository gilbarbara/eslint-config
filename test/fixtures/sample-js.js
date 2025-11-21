/* eslint-disable no-unused-vars */

// Test import ordering
import z from 'z';
import a from 'a';
import { unusedImport } from 'unused'; // Test unused-imports

// Test unused variable
const unusedVariable = 'test';

// Test sorting destructuring keys
const { z: destructuredZ, a: destructuredA } = { a: 1, z: 2 };

// Test regexp issues
const badRegex = /[a-a]/; // Empty range

// Test promise issues
function fetchData() {
  fetch('/api/data').then(response => response.json()); // Missing catch
}

// Test function spacing and formatting
function badlyFormattedFunction( ){
  const object={
    key:'value'
  };
  return object;
}
