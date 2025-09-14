import { beforeEach, describe, expect, it } from 'vitest';

import { getConfigPath, isRuleConfigured } from '../utils/eslint-utils';

describe('Base Configuration Rules', () => {
  let config;

  beforeEach(() => {
    config = require(getConfigPath('base'));
  });

  describe('Core ESLint Rules', () => {
    it('should configure alert rules appropriately', () => {
      expect(isRuleConfigured(config, 'no-alert')).toBe(true);
      expect(config.rules['no-alert']).toBe('warn');
    });

    it('should configure import ordering rules', () => {
      expect(isRuleConfigured(config, 'import/order')).toBe(true);
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
  });

  describe('TypeScript Override Rules', () => {
    it('should have TypeScript-specific overrides', () => {
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride).toBeDefined();
      expect(tsOverride.rules).toBeDefined();
    });

    it('should configure TypeScript-specific rules', () => {
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(tsOverride.rules['@typescript-eslint/no-explicit-any']).toBe('off');
      expect(tsOverride.rules['@typescript-eslint/no-unused-vars']).toBeDefined();
      expect(tsOverride.rules['@typescript-eslint/no-unused-vars']).toEqual([
        'warn',
        { args: 'none', ignoreRestSiblings: true },
      ]);
    });
  });

  describe('Parser Configuration', () => {
    it('should use correct parsers for different file types', () => {
      const jsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.js?(x)'),
      );
      const tsOverride = config.overrides.find(
        override => override.files && override.files.includes('**/*.ts?(x)'),
      );

      expect(jsOverride.parser).toBe('@babel/eslint-parser');
      expect(tsOverride.parser).toBe('@typescript-eslint/parser');
    });
  });

  describe('Environment Configuration', () => {
    it('should set appropriate environments', () => {
      expect(config.env).toBeDefined();
      expect(config.env.commonjs).toBe(true);
      expect(config.env.es6).toBe(true);
      expect(config.env.node).toBe(true);
    });
  });

  describe('Import Settings', () => {
    it('should configure import resolvers', () => {
      expect(config.settings).toBeDefined();
      expect(config.settings['import/resolver']).toBeDefined();
      expect(config.settings['import/resolver'].node).toBeDefined();
      expect(config.settings['import/resolver'].typescript).toBeDefined();
    });
  });
});
