import { beforeEach, describe, expect, it } from 'vitest';

import { getConfigPath, hasPlugin, isRuleConfigured } from '../utils/helpers.js';

describe('React Configuration Rules', () => {
  let config;

  beforeEach(async () => {
    const module = await import(getConfigPath('react'));

    config = module.default;
  });

  describe('React Plugin Rules', () => {
    it('should include React plugins', () => {
      expect(hasPlugin(config, '@eslint-react')).toBe(true);
      expect(hasPlugin(config, '@gilbarbara')).toBe(true);
      expect(hasPlugin(config, '@stylistic')).toBe(true);
      expect(hasPlugin(config, 'perfectionist')).toBe(true);
      expect(hasPlugin(config, 'react-hooks')).toBe(true);
      expect(hasPlugin(config, 'react-refresh')).toBe(true);
      expect(hasPlugin(config, 'jsx-a11y-x')).toBe(true);
    });

    it('should configure React-specific rules', () => {
      expect(isRuleConfigured(config, '@eslint-react/no-array-index-key')).toBe(true);
      expect(isRuleConfigured(config, '@gilbarbara/jsx-no-undef')).toBe(true);
      expect(isRuleConfigured(config, '@stylistic/jsx-self-closing-comp')).toBe(true);
    });

    it('should configure React Hooks rules', () => {
      expect(isRuleConfigured(config, 'react-hooks/rules-of-hooks')).toBe(true);
      expect(isRuleConfigured(config, 'react-hooks/exhaustive-deps')).toBe(true);
    });

    it('should configure JSX A11y rules', () => {
      expect(isRuleConfigured(config, 'jsx-a11y-x/alt-text')).toBe(true);
      expect(isRuleConfigured(config, 'jsx-a11y-x/click-events-have-key-events')).toBe(true);
      expect(isRuleConfigured(config, 'jsx-a11y-x/no-static-element-interactions')).toBe(true);
    });

    it('should configure React Refresh rules', () => {
      expect(isRuleConfigured(config, 'react-refresh/only-export-components')).toBe(true);
    });
  });

  describe('Parser Options', () => {
    it('should enable JSX in parser options', () => {
      const mainConfig = config[0];

      expect(mainConfig.languageOptions).toBeDefined();
      expect(mainConfig.languageOptions.parserOptions).toBeDefined();
      expect(mainConfig.languageOptions.parserOptions.ecmaFeatures).toBeDefined();
      expect(mainConfig.languageOptions.parserOptions.ecmaFeatures.jsx).toBe(true);
    });
  });
});
