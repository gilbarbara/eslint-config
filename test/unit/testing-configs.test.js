import { beforeEach, describe, expect, it } from 'vitest';

import { getConfigForFiles, getConfigPath, getRuleValue, hasPlugin } from '../utils/helpers.js';

describe('Testing Framework Configurations', () => {
  describe('Jest Configuration', () => {
    let config;

    beforeEach(async () => {
      const module = await import(getConfigPath('jest'));

      config = module.default;
    });

    it('should be a flat config array', () => {
      expect(Array.isArray(config)).toBe(true);
    });

    it('should include Jest plugins', () => {
      expect(hasPlugin(config, 'jest')).toBe(true);
      expect(hasPlugin(config, 'jest-dom')).toBe(true);
    });

    it('should have Jest globals', () => {
      const mainConfig = config[0];

      expect(mainConfig.languageOptions).toBeDefined();
      expect(mainConfig.languageOptions.globals).toBeDefined();
    });

    it('should target test files', () => {
      const mainConfig = config[0];

      expect(mainConfig.files).toBeDefined();
      expect(mainConfig.files.some(pattern => pattern.includes('.test.'))).toBe(true);
    });
  });

  describe('Vitest Configuration', () => {
    let config;

    beforeEach(async () => {
      const module = await import(getConfigPath('vitest'));

      config = module.default;
    });

    it('should include Vitest plugin', () => {
      expect(hasPlugin(config, 'vitest')).toBe(true);
    });

    it('should configure Vitest-specific rules', () => {
      expect(getRuleValue(config, 'vitest/no-focused-tests')).toBe('error');
      expect(getRuleValue(config, 'vitest/consistent-test-it')).toBe('warn');
      expect(getRuleValue(config, 'vitest/no-done-callback')).toBe('error');
    });

    it('should target test files', () => {
      const mainConfig = config[0];

      expect(mainConfig.files).toBeDefined();
      expect(mainConfig.files.some(pattern => pattern.includes('.test.'))).toBe(true);
    });
  });

  describe('Testing Library Configuration', () => {
    let config;

    beforeEach(async () => {
      const module = await import(getConfigPath('testing-library'));

      config = module.default;
    });

    it('should be a flat config array', () => {
      expect(Array.isArray(config)).toBe(true);
    });

    it('should target test files', () => {
      const mainConfig = config[0];

      expect(mainConfig.files).toBeDefined();
      expect(mainConfig.files.some(pattern => pattern.includes('.test.'))).toBe(true);
    });
  });

  describe('Node.js Configuration', () => {
    let config;

    beforeEach(async () => {
      const module = await import(getConfigPath('node'));

      config = module.default;
    });

    it('should be a flat config array', () => {
      expect(Array.isArray(config)).toBe(true);
    });

    it('should include Node.js plugin', () => {
      expect(hasPlugin(config, 'n')).toBe(true);
    });

    it('should configure Node.js-specific rules', () => {
      expect(getRuleValue(config, 'n/no-deprecated-api')).toBe('error');
      expect(getRuleValue(config, 'n/prefer-promises/fs')).toBe('warn');
      expect(getRuleValue(config, 'n/no-path-concat')).toBe('error');
    });
  });

  describe('Type Checking Configuration', () => {
    let config;

    beforeEach(async () => {
      const module = await import(getConfigPath('type-checking'));

      config = module.default;
    });

    it('should be a flat config array', () => {
      expect(Array.isArray(config)).toBe(true);
    });

    it('should have TypeScript configuration', () => {
      const tsConfig = getConfigForFiles(config, '.ts');

      expect(tsConfig).toBeDefined();
    });

    it('should configure project service for type checking', () => {
      // Find the config with projectService (may not be in the first TS config)
      const configWithProjectService = config.find(
        c =>
          c.files?.some(f => f.includes('.ts')) &&
          c.languageOptions?.parserOptions?.projectService !== undefined,
      );

      expect(configWithProjectService).toBeDefined();
      expect(configWithProjectService.languageOptions.parserOptions.projectService).toBe(true);
    });

    it('should only apply to TypeScript files', () => {
      const tsConfig = getConfigForFiles(config, '.ts');

      expect(tsConfig).toBeDefined();
      expect(tsConfig.files.some(pattern => pattern.includes('.ts'))).toBe(true);
    });
  });
});
