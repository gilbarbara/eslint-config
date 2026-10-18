import { ESLint, Linter } from 'eslint';
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

    it('should detect sonarjs issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-js.js'));
      const sonarViolations = getViolationsForRule(result, 'sonarjs/no-all-duplicated-branches');

      expect(sonarViolations.length).toBeGreaterThan(0);
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

    it('should resolve TypeScript type imports', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts-import.ts'));
      const unresolvedViolations = getViolationsForRule(result, 'import-x/no-unresolved');

      expect(unresolvedViolations).toHaveLength(0);
    });

    it('should not warn about padding before exported function overload implementation', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-ts.ts'));
      const paddingViolations = getViolationsForRule(
        result,
        '@stylistic/padding-line-between-statements',
      );

      // Only the missing blank line between export const and export function should warn
      expect(paddingViolations).toHaveLength(1);
      expect(paddingViolations[0].line).toBe(48);
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
        message => message.ruleId && message.ruleId.startsWith('jsx-a11y-x/'),
      );

      expect(a11yViolations.length).toBeGreaterThan(0);
      expect(a11yViolations.some(v => v.ruleId === 'jsx-a11y-x/alt-text')).toBe(true);
    });

    it('should lint .jsx files with the react config alone', async () => {
      const reactOnly = await createESLintWithConfig(getConfigPath('react'));
      const [result] = await reactOnly.lintText(
        'export const a = <Widget id="1" className="2" />;\n',
        { filePath: getFixturePath('inline.jsx') },
      );

      expect(result.messages.map(m => m.ruleId)).toEqual([
        '@gilbarbara/jsx-no-undef',
        'perfectionist/sort-jsx-props',
      ]);
    });

    it('should detect React Hook dependency issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-react.tsx'));
      const hookViolations = getViolationsForRule(result, 'react-hooks/exhaustive-deps');

      expect(hookViolations.length).toBeGreaterThan(0);
      expect(hookViolations[0].severity).toBe(1);
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

  // The @gilbarbara/* kit recipes must report where the eslint-plugin-react rules they
  // replace did; the line numbers below were captured from those originals.
  describe('React Kit Rules Integration', () => {
    let result;

    beforeEach(async () => {
      const eslint = await createESLintWithConfig(getConfigPath('index'));

      result = await lintFile(eslint, getFixturePath('sample-react-custom-rules.jsx'));
    });

    it('should flag props access that is not destructured', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/destructuring-assignment');

      expect(violations).toHaveLength(2);
      expect(violations.every(v => v.severity === 2)).toBe(true);
      expect(violations.map(v => v.line)).toEqual([7, 17]);
    });

    it('should flag named components defined as arrow functions', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/function-component-definition');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(11);
    });

    it('should flag explicit boolean attribute values', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-boolean-value');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(22);
    });

    it('should flag .bind() usage in JSX props on non-DOM components', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-no-bind');

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe(2);
      expect(violations[0].line).toBe(27);
    });

    it('should flag duplicate JSX props, ignoring case', () => {
      const violations = getViolationsForRule(result, '@gilbarbara/jsx-no-duplicate-props');

      expect(violations.map(v => [v.line, v.severity])).toEqual([[51, 2]]);
    });

    it('should flag JSX components that are not defined', async () => {
      // In JS, base's core no-undef also reports a name that isn't a global.
      expect(getViolationsForRule(result, 'no-undef').map(v => v.line)).toEqual([32]);
      expect(getViolationsForRule(result, '@gilbarbara/jsx-no-undef').map(v => v.line)).toEqual([
        32,
      ]);

      const eslint = await createESLintWithConfig(getConfigPath('index'));
      const [jsResult] = await eslint.lintText('export const App = () => <File />;\n', {
        filePath: getFixturePath('inline.jsx'),
      });

      // `File` is a Node global, so only the kit rule catches the missing import.
      expect(getViolationsForRule(jsResult, 'no-undef')).toHaveLength(0);
      expect(getViolationsForRule(jsResult, '@gilbarbara/jsx-no-undef')).toHaveLength(1);

      const [tsResult] = await eslint.lintText('export const App = () => <Missing />;\n', {
        filePath: getFixturePath('inline.tsx'),
      });
      const violations = getViolationsForRule(tsResult, '@gilbarbara/jsx-no-undef');

      expect(violations.map(v => [v.line, v.severity])).toEqual([[1, 2]]);
    });

    it('should not report variables or imports used only in JSX as unused', async () => {
      expect(getViolationsForRule(result, 'no-unused-vars')).toHaveLength(0);
      expect(getViolationsForRule(result, 'unused-imports/no-unused-vars')).toHaveLength(0);

      const eslint = await createESLintWithConfig(getConfigPath('index'));
      const [jsxResult] = await eslint.lintText(
        "import Card from './card';\n\nexport const App = () => <Card />;\n",
        { filePath: getFixturePath('inline.jsx') },
      );

      expect(getViolationsForRule(jsxResult, 'no-unused-vars')).toHaveLength(0);
      expect(getViolationsForRule(jsxResult, 'unused-imports/no-unused-imports')).toHaveLength(0);
    });

    it('should apply the JSX style rules that replaced react/*', () => {
      const lines = rule => getViolationsForRule(result, rule).map(v => [v.line, v.severity]);

      expect(lines('@stylistic/jsx-self-closing-comp')).toEqual([[41, 2]]);
      expect(lines('@stylistic/jsx-curly-brace-presence')).toEqual([[42, 2]]);
      expect(lines('@stylistic/jsx-pascal-case')).toEqual([[43, 2]]);
      expect(lines('perfectionist/sort-jsx-props')).toEqual([[44, 1]]);
    });

    it('should sort JSX props naturally with reserved props first', async () => {
      const { default: perfectionist } = await import('eslint-plugin-perfectionist');
      const { default: reactRules } = await import(getConfigPath('rules/react'));
      const linter = new Linter({ configType: 'flat' });
      const config = [
        {
          files: ['**/*.jsx'],
          languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
          plugins: { perfectionist },
          rules: { 'perfectionist/sort-jsx-props': reactRules['perfectionist/sort-jsx-props'] },
        },
      ];
      const { output } = linter.verifyAndFix(
        'const a = <Widget zeta="1" Alpha="2" key="k" item10="a" ref={r} item2="b" />;',
        config,
        'component.jsx',
      );

      expect(output).toBe(
        'const a = <Widget key="k" ref={r} Alpha="2" item2="b" item10="a" zeta="1" />;',
      );
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

  describe('Node.js Configuration Integration', () => {
    let eslint;

    beforeEach(async () => {
      const baseModule = await import(getConfigPath('base'));
      const nodeModule = await import(getConfigPath('node'));

      const combinedConfig = [...baseModule.default, ...nodeModule.default];

      eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: combinedConfig,
        ignore: false,
      });
    });

    it('should detect deprecated Node.js APIs', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const deprecatedViolations = getViolationsForRule(result, 'n/no-deprecated-api');

      expect(deprecatedViolations.length).toBeGreaterThan(0);
    });

    it('should detect path concatenation issues', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const pathViolations = getViolationsForRule(result, 'n/no-path-concat');

      expect(pathViolations.length).toBeGreaterThan(0);
    });

    it('should suggest node: protocol', async () => {
      const result = await lintFile(eslint, getFixturePath('sample-node.js'));
      const protocolViolations = getViolationsForRule(result, 'n/prefer-node-protocol');

      expect(protocolViolations.length).toBeGreaterThan(0);
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
