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

/**
 * Normalize an alpha value to the 0-1 range.
 * Values > 1 are treated as percentages and divided by 100.
 */
export function normalizeAlpha(value: number): number;
export function normalizeAlpha(value: number | undefined): number | undefined;
export function normalizeAlpha(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value > 1 ? value / 100 : value;
}

// Test export const -> export function (should require blank line)
export const alphaDefault = 1;
export function getAlpha() {
  return alphaDefault;
}
