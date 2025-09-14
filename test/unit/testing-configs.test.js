import { beforeEach, describe, expect, it } from 'vitest';

import { getConfigPath } from '../utils/eslint-utils';

describe('Testing Framework Configurations', () => {
  describe('Jest Configuration', () => {
    let config;

    beforeEach(() => {
      config = require(getConfigPath('jest'));
    });

    it('should extend Jest configurations', () => {
      expect(config.extends).toBeDefined();
      expect(config.extends).toContain('plugin:jest/recommended');
      expect(config.extends).toContain('plugin:jest-dom/recommended');
    });

    it('should set Jest environment', () => {
      expect(config.env).toBeDefined();
      expect(config.env.jest).toBe(true);
    });

    it('should have Jest settings', () => {
      expect(config.settings).toBeDefined();
      expect(config.settings.jest).toBeDefined();
      expect(config.settings.jest.version).toBe(30);
    });
  });

  describe('Vitest Configuration', () => {
    let config;

    beforeEach(() => {
      config = require(getConfigPath('vitest'));
    });

    it('should include Vitest plugin', () => {
      expect(config.plugins).toContain('@vitest');
    });

    it('should configure Vitest-specific rules', () => {
      expect(config.rules['@vitest/no-focused-tests']).toBe('error');
      expect(config.rules['@vitest/consistent-test-it']).toBe('warn');
      expect(config.rules['@vitest/no-done-callback']).toBe('error');
    });

    it('should extend legacy recommended config', () => {
      expect(config.extends).toBeDefined();
      expect(config.extends).toContain('plugin:@vitest/legacy-recommended');
    });
  });

  describe('Testing Library Configuration', () => {
    let config;

    beforeEach(() => {
      config = require(getConfigPath('testing-library'));
    });

    it('should extend Testing Library React configuration', () => {
      expect(config.extends).toBeDefined();
      expect(config.extends).toContain('plugin:testing-library/react');
    });
  });

  describe('Type Checking Configuration', () => {
    let config;

    beforeEach(() => {
      config = require(getConfigPath('type-checking'));
    });

    it('should have overrides with TypeScript project configuration', () => {
      expect(config.overrides).toBeDefined();
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride).toBeDefined();
      expect(tsOverride.parserOptions).toBeDefined();
      expect(tsOverride.parserOptions.project).toBeDefined();
    });

    it('should extend recommended type checking configuration', () => {
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride.extends).toBeDefined();
      expect(tsOverride.extends).toContain(
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      );
    });

    it('should only apply to TypeScript files', () => {
      expect(config.overrides).toBeDefined();
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride).toBeDefined();
    });
  });
});
