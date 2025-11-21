/* eslint-disable no-unused-vars */

// Test deprecated API (Buffer constructor)
const buf = new Buffer(10); // Deprecated

// Test path concatenation
const path = require('path');
const filePath = __dirname + '/file.js'; // Should use path.join

// Test callback-style fs instead of promises
const fs = require('fs');
fs.readFile('file.txt', (err, data) => {
  console.log(data);
});

// Test non-node: protocol import
const util = require('util'); // Should use 'node:util'

function main() {
  return 'Node.js sample';
}
