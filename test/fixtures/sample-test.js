// Test Jest/Vitest specific rules
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Sample test suite', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  // Test focused test (should warn)
  it.only('focused test', () => {
    expect(true).toBe(true);
  });

  // Test disabled test
  it.skip('skipped test', () => {
    expect(false).toBe(true);
  });

  // Test async test
  it('async test', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(true).toBe(true);
  });
});
