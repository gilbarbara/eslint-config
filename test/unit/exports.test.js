import { describe, expect, it } from 'vitest';

import { getConfigForFiles, getConfigPath, hasPlugin } from '../utils/helpers.js';

describe('Configuration Exports', () => {
  const configs = ['index', 'base', 'react', 'jest', 'vitest', 'testing-library', 'type-checking'];

  configs.forEach(configName => {
    describe(`${configName} configuration`, () => {
      it('should be a valid ESLint flat configuration', async () => {
        const configPath = getConfigPath(configName);
        const module = await import(configPath);
        const config = module.default;

        expect(config).toBeDefined();
        expect(Array.isArray(config)).toBe(true);
      });

      it('should have configuration objects', async () => {
        const configPath = getConfigPath(configName);
        const module = await import(configPath);
        const config = module.default;

        expect(config.length).toBeGreaterThan(0);
        config.forEach(configItem => {
          expect(typeof configItem).toBe('object');
        });
      });
    });
  });

  describe('Main index configuration', () => {
    it('should combine base and react configurations', async () => {
      const module = await import(getConfigPath('index'));
      const config = module.default;

      expect(Array.isArray(config)).toBe(true);
      expect(config.length).toBeGreaterThan(0);
    });

    it('should export named configurations', async () => {
      const module = await import(getConfigPath('index'));

      expect(module.base).toBeDefined();
      expect(module.react).toBeDefined();
      expect(module.jest).toBeDefined();
      expect(module.vitest).toBeDefined();
      expect(module.testingLibrary).toBeDefined();
      expect(module.typeChecking).toBeDefined();
    });
  });

  describe('Base configuration', () => {
    it('should have core plugin configurations', async () => {
      const module = await import(getConfigPath('base'));
      const config = module.default;

      expect(hasPlugin(config, '@babel')).toBe(true);
      expect(hasPlugin(config, 'import-x')).toBe(true);
      expect(hasPlugin(config, 'perfectionist')).toBe(true);
      expect(hasPlugin(config, 'sort-destructure-keys')).toBe(true);
      expect(hasPlugin(config, 'unicorn')).toBe(true);
    });

    it('should have TypeScript configuration', async () => {
      const module = await import(getConfigPath('base'));
      const config = module.default;

      const tsConfig = getConfigForFiles(config, '.ts');

      expect(tsConfig).toBeDefined();
      expect(tsConfig.languageOptions.parser).toBeDefined();
    });
  });

  describe('React configuration', () => {
    it('should include React-specific plugins', async () => {
      const module = await import(getConfigPath('react'));
      const config = module.default;

      expect(hasPlugin(config, 'react')).toBe(true);
      expect(hasPlugin(config, 'react-hooks')).toBe(true);
      expect(hasPlugin(config, 'jsx-a11y')).toBe(true);
    });

    it('should have different settings for JS and TS files', async () => {
      const module = await import(getConfigPath('react'));
      const config = module.default;

      const jsConfig = getConfigForFiles(config, '.js');
      const tsConfig = getConfigForFiles(config, '.ts');

      expect(jsConfig).toBeDefined();
      expect(tsConfig).toBeDefined();
    });
  });
});
