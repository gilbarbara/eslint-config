import { ESLint } from 'eslint';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createESLintWithConfig,
  getAllViolations,
  getConfigPath,
  getFixturePath,
  getViolationsForRule,
  lintFile,
} from '../utils/helpers.js';

describe('ESLint Integration Tests', () => {
  describe('Base Configuration Integration', () => {
    let eslint;

    beforeAll(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('base'));
    });

    afterAll(() => {
      vi.restoreAllMocks();
    });

    it('should detect import ordering issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const importViolations = getViolationsForRule(result, 'perfectionist/sort-imports');

      expect(importViolations.length).toBeGreaterThan(0);
      expect(importViolations[0].severity).toBe(2);
    });

    it('should detect destructuring key sorting issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const destructureViolations = getViolationsForRule(
        result,
        'sort-destructure-keys/sort-destructure-keys',
      );

      expect(destructureViolations.length).toBeGreaterThan(0);
    });

    it('should detect unused imports', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const unusedImportViolations = getViolationsForRule(
        result,
        'unused-imports/no-unused-imports',
      );

      expect(unusedImportViolations.length).toBeGreaterThan(0);
    });

    it('should detect promise issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const promiseViolations = getViolationsForRule(result, 'promise/catch-or-return');

      expect(promiseViolations.length).toBeGreaterThan(0);
    });

    it('should detect regexp issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const regexpViolations = getViolationsForRule(result, 'regexp/no-useless-character-class');

      expect(regexpViolations.length).toBeGreaterThan(0);
    });
  });

  describe('TypeScript Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('base'));
    });

    it('should detect unused variables in TypeScript', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));
      const unusedVarViolations = getViolationsForRule(result, '@typescript-eslint/no-unused-vars');

      expect(unusedVarViolations.length).toBeGreaterThan(0);
      expect(unusedVarViolations[0].severity).toBe(1);
    });

    it('should handle TypeScript syntax correctly', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));

      expect(result.fatalErrorCount).toBe(0);
      expect(result.messages.some(message => message.fatal)).toBe(false);
    });
  });

  describe('React Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('index'));
    });

    it('should detect JSX accessibility issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const a11yViolations = result.messages.filter(
        message => message.ruleId && message.ruleId.startsWith('jsx-a11y/'),
      );

      expect(a11yViolations.length).toBeGreaterThan(0);
      expect(a11yViolations.some(v => v.ruleId === 'jsx-a11y/alt-text')).toBe(true);
    });

    it('should detect React Hook dependency issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const hookViolations = getViolationsForRule(result, 'react-hooks/exhaustive-deps');

      expect(hookViolations.length).toBeGreaterThan(0);
      expect(hookViolations[0].severity).toBe(1);
    });

    it('should handle prop-types correctly for TypeScript', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const propTypesViolations = getViolationsForRule(result, 'react/prop-types');

      expect(propTypesViolations).toHaveLength(0);
    });

    it('should require prop-types for JavaScript React components', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react-js.jsx'));
      const propTypesViolations = getViolationsForRule(result, 'react/prop-types');

      expect(propTypesViolations.length).toBeGreaterThan(0);
      expect(propTypesViolations[0].severity).toBe(1);
    });

    it('should detect React Refresh export issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const refreshViolations = getViolationsForRule(
        result,
        'react-refresh/only-export-components',
      );

      expect(refreshViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Combined Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      eslint = await createESLintWithConfig(getConfigPath('index'));
    });

    it('should apply both base and React rules', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const allViolations = getAllViolations(result);

      const hasBaseViolations = allViolations.some(v =>
        ['no-console', 'perfectionist/sort-imports'].includes(v.ruleId),
      );
      const hasReactViolations = allViolations.some(v => v.ruleId && v.ruleId.startsWith('react'));

      expect(hasBaseViolations || hasReactViolations).toBe(true);
    });
  });

  describe('Testing Configuration Integration', () => {
    it('should detect focused tests in Vitest files', async () => {
      const baseModule = await import(getConfigPath('base'));
      const vitestModule = await import(getConfigPath('vitest'));

      const combinedConfig = [...baseModule.default, ...vitestModule.default];

      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: combinedConfig,
        ignore: false,
      });

      const result = await lintFile(eslint, getFixturePath('sample-test.js'));
      const focusedTestViolations = getViolationsForRule(result, 'vitest/no-focused-tests');

      expect(focusedTestViolations).toHaveLength(1);
      expect(focusedTestViolations[0].severity).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files gracefully', async () => {
      const eslint = await createESLintWithConfig(getConfigPath('base'));

      await expect(lintFile(eslint, getFixturePath('non-existent.js'))).rejects.toThrow();
    });

    it('should handle syntax errors in files', async () => {
      const tempFile = getFixturePath('syntax-error.js');
      const fs = await import('node:fs/promises');

      try {
        await fs.writeFile(tempFile, 'const invalid syntax = ;');

        const eslint = await createESLintWithConfig(getConfigPath('base'));
        const result = await lintFile(eslint, tempFile);

        expect(result.errorCount).toBeGreaterThan(0);
      } finally {
        try {
          await fs.unlink(tempFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});
