import { beforeEach, describe, expect, it } from 'vitest';

import { getConfigPath, isRuleConfigured } from '../utils/eslint-utils';

describe('React Configuration Rules', () => {
  let config;

  beforeEach(() => {
    config = require(getConfigPath('react'));
  });

  describe('React Plugin Rules', () => {
    it('should include React plugins', () => {
      expect(config.plugins).toContain('react');
      expect(config.plugins).toContain('react-hooks');
      expect(config.plugins).toContain('jsx-a11y');
    });

    it('should configure React-specific rules', () => {
      expect(isRuleConfigured(config, 'react/jsx-uses-react')).toBe(true);
      expect(isRuleConfigured(config, 'react/jsx-uses-vars')).toBe(true);
      expect(isRuleConfigured(config, 'react/react-in-jsx-scope')).toBe(true);
    });

    it('should configure React Hooks rules', () => {
      expect(isRuleConfigured(config, 'react-hooks/rules-of-hooks')).toBe(true);
      expect(isRuleConfigured(config, 'react-hooks/exhaustive-deps')).toBe(true);
    });

    it('should configure JSX A11y rules', () => {
      expect(isRuleConfigured(config, 'jsx-a11y/alt-text')).toBe(true);
      expect(isRuleConfigured(config, 'jsx-a11y/click-events-have-key-events')).toBe(true);
      expect(isRuleConfigured(config, 'jsx-a11y/no-static-element-interactions')).toBe(true);
    });
  });

  describe('File-specific Overrides', () => {
    it('should have different prop-types rules for JS vs TS', () => {
      const jsOverride = config.overrides.find(
        override => override.files && override.files.some(file => file.includes('.js')),
      );
      const tsOverride = config.overrides.find(
        override => override.files && override.files.some(file => file.includes('.ts')),
      );

      // JS files should warn about missing prop-types
      if (jsOverride && jsOverride.rules) {
        expect(jsOverride.rules['react/prop-types']).toBe('warn');
      }

      // TS files should disable prop-types
      if (tsOverride && tsOverride.rules) {
        expect(tsOverride.rules['react/prop-types']).toBe('off');
      }
    });
  });

  describe('React Rules', () => {
    it('should configure React component rules', () => {
      expect(isRuleConfigured(config, 'react/jsx-uses-react')).toBe(true);
      expect(isRuleConfigured(config, 'react/jsx-uses-vars')).toBe(true);
    });
  });

  describe('Parser Options', () => {
    it('should enable JSX in parser options', () => {
      expect(config.parserOptions).toBeDefined();
      expect(config.parserOptions.ecmaFeatures).toBeDefined();
      expect(config.parserOptions.ecmaFeatures.jsx).toBe(true);
    });
  });
});
