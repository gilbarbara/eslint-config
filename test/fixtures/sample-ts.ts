/* eslint-disable no-unused-vars */

// Test TypeScript-specific rules
interface TestInterface {
  name: string;
  value: number;
}

// Test any usage (should trigger warning)
const anyVariable: any = 'test';

// Test unused variable
const unusedTsVariable: string = 'test';

// Test function with explicit return type
function testFunction(): TestInterface {
  return {
    name: 'test',
    value: 42,
  };
}

// Test class definition
class TestClass {
  private readonly property: string;
  
  constructor(property: string) {
    this.property = property;
  }
}