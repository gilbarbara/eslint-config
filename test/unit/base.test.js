import { beforeEach, describe, expect, it } from 'vitest';

import {
  getConfigForFiles,
  getConfigPath,
  getRuleValue,
  hasPlugin,
  isRuleConfigured,
} from '../utils/helpers.js';

describe('Base Configuration Rules', () => {
  let config;

  beforeEach(async () => {
    const module = await import(getConfigPath('base'));

    config = module.default;
  });

  describe('Core ESLint Rules', () => {
    it('should configure alert rules appropriately', () => {
      expect(isRuleConfigured(config, 'no-alert')).toBe(true);
      expect(getRuleValue(config, 'no-alert')).toBe('warn');
    });

    it('should configure import ordering rules', () => {
      expect(isRuleConfigured(config, 'import-x/order')).toBe(true);
    });

    it('should configure unicorn rules', () => {
      expect(isRuleConfigured(config, 'unicorn/better-regex')).toBe(true);
      expect(isRuleConfigured(config, 'unicorn/no-for-loop')).toBe(true);
    });

    it('should configure perfectionist sorting rules', () => {
      expect(isRuleConfigured(config, 'perfectionist/sort-imports')).toBe(true);
      expect(isRuleConfigured(config, 'perfectionist/sort-named-imports')).toBe(true);
    });

    it('should configure sort-destructure-keys rule', () => {
      expect(isRuleConfigured(config, 'sort-destructure-keys/sort-destructure-keys')).toBe(true);
    });

    it('should configure promise rules', () => {
      expect(isRuleConfigured(config, 'promise/catch-or-return')).toBe(true);
      expect(isRuleConfigured(config, 'promise/no-return-wrap')).toBe(true);
    });

    it('should configure regexp rules', () => {
      expect(isRuleConfigured(config, 'regexp/no-dupe-characters-character-class')).toBe(true);
      expect(isRuleConfigured(config, 'regexp/no-empty-group')).toBe(true);
    });

    it('should configure unused-imports rules', () => {
      expect(isRuleConfigured(config, 'unused-imports/no-unused-imports')).toBe(true);
      expect(isRuleConfigured(config, 'unused-imports/no-unused-vars')).toBe(true);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have TypeScript-specific configuration', () => {
      const tsConfig = getConfigForFiles(config, '.ts');

      expect(tsConfig).toBeDefined();
    });

    it('should configure TypeScript-specific rules', () => {
      // Find the TS config with our custom rules (the last one with our rule overrides)
      const tsConfigs = config.filter(
        c =>
          c.files?.some(f => f.includes('.ts')) &&
          c.rules?.['@typescript-eslint/no-explicit-any'] !== undefined,
      );

      // Get the last one which should have our overrides
      const tsConfigWithRules = tsConfigs[tsConfigs.length - 1];

      expect(tsConfigWithRules).toBeDefined();
      expect(tsConfigWithRules.rules['@typescript-eslint/no-explicit-any']).toBe('off');
      expect(tsConfigWithRules.rules['@typescript-eslint/no-unused-vars']).toBeDefined();
      expect(tsConfigWithRules.rules['@typescript-eslint/no-unused-vars']).toEqual([
        'warn',
        { args: 'none', ignoreRestSiblings: true },
      ]);
    });
  });

  describe('Parser Configuration', () => {
    it('should use correct parsers for different file types', () => {
      const jsConfig = getConfigForFiles(config, '.js');
      const tsConfig = getConfigForFiles(config, '.ts');

      expect(jsConfig.languageOptions.parser).toBeDefined();
      expect(tsConfig.languageOptions.parser).toBeDefined();
    });
  });

  describe('Globals Configuration', () => {
    it('should set appropriate globals', () => {
      const mainConfig = config[0];

      expect(mainConfig.languageOptions).toBeDefined();
      expect(mainConfig.languageOptions.globals).toBeDefined();
    });
  });

  describe('Import Settings', () => {
    it('should configure import resolvers', () => {
      const mainConfig = config[0];

      expect(mainConfig.settings).toBeDefined();
      expect(mainConfig.settings['import-x/resolver']).toBeDefined();
      expect(mainConfig.settings['import-x/resolver'].node).toBeDefined();
    });
  });

  describe('Plugins', () => {
    it('should have core plugins configured', () => {
      expect(hasPlugin(config, '@babel')).toBe(true);
      expect(hasPlugin(config, 'import-x')).toBe(true);
      expect(hasPlugin(config, 'perfectionist')).toBe(true);
      expect(hasPlugin(config, 'promise')).toBe(true);
      expect(hasPlugin(config, 'regexp')).toBe(true);
      expect(hasPlugin(config, 'sort-destructure-keys')).toBe(true);
      expect(hasPlugin(config, 'unicorn')).toBe(true);
      expect(hasPlugin(config, 'unused-imports')).toBe(true);
    });
  });
});
