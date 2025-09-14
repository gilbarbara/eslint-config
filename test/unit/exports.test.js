import { describe, expect, it } from 'vitest';

import { getConfigPath } from '../utils/eslint-utils';

describe('Configuration Exports', () => {
  const configs = ['index', 'base', 'react', 'jest', 'vitest', 'testing-library', 'type-checking'];

  configs.forEach(configName => {
    describe(`${configName} configuration`, () => {
      it('should be a valid ESLint configuration', () => {
        const configPath = getConfigPath(configName);
        const config = require(configPath);

        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
      });

      it('should have required properties', () => {
        const configPath = getConfigPath(configName);
        const config = require(configPath);

        // All configs should have at least rules, extends, or overrides
        const hasRules = config.rules && typeof config.rules === 'object';
        const hasExtends =
          config.extends && (Array.isArray(config.extends) || typeof config.extends === 'string');
        const hasOverrides = config.overrides && Array.isArray(config.overrides);

        expect(hasRules || hasExtends || hasOverrides).toBe(true);
      });
    });
  });

  describe('Main index configuration', () => {
    it('should extend base and react configurations', () => {
      const config = require(getConfigPath('index'));

      expect(config.extends).toBeDefined();
      expect(Array.isArray(config.extends)).toBe(true);
      expect(config.extends).toHaveLength(2);
    });
  });

  describe('Base configuration', () => {
    it('should have core plugin configurations', () => {
      const config = require(getConfigPath('base'));

      expect(config.plugins).toContain('@babel');
      expect(config.plugins).toContain('import');
      expect(config.plugins).toContain('perfectionist');
      expect(config.plugins).toContain('sort-destructure-keys');
      expect(config.plugins).toContain('unicorn');
    });

    it('should have TypeScript overrides', () => {
      const config = require(getConfigPath('base'));

      expect(config.overrides).toBeDefined();
      expect(Array.isArray(config.overrides)).toBe(true);

      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride).toBeDefined();
      expect(tsOverride.parser).toBe('@typescript-eslint/parser');
    });
  });

  describe('React configuration', () => {
    it('should include React-specific plugins', () => {
      const config = require(getConfigPath('react'));

      expect(config.plugins).toContain('react');
      expect(config.plugins).toContain('react-hooks');
      expect(config.plugins).toContain('jsx-a11y');
    });

    it('should have different settings for JS and TS files', () => {
      const config = require(getConfigPath('react'));

      expect(config.overrides).toBeDefined();
      expect(Array.isArray(config.overrides)).toBe(true);
    });
  });
});
