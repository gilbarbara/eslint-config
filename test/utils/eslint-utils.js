import path from 'node:path';

import { ESLint } from 'eslint';

/**
 * Create ESLint instance with given configuration
 */
export function createESLintInstance(configPath) {
  return new ESLint({
    baseConfig: require(configPath),
    useEslintrc: false,
    ignore: false,
  });
}

/**
 * Get all violations from lint results
 */
export function getAllViolations(lintResult) {
  return lintResult.messages;
}

/**
 * Get the config file path
 */
export function getConfigPath(configName) {
  return path.resolve(__dirname, '../../src', `${configName}.js`);
}

/**
 * Get the fixture file path
 */
export function getFixturePath(filename) {
  return path.resolve(__dirname, '../fixtures', filename);
}

/**
 * Get specific rule violations from lint results
 */
export function getViolationsForRule(lintResult, ruleId) {
  return lintResult.messages.filter(message => message.ruleId === ruleId);
}

/**
 * Check if a specific rule is configured in the config
 */
export function isRuleConfigured(config, ruleId) {
  return config.rules && config.rules[ruleId] !== undefined;
}

/**
 * Run ESLint on a file and return results
 */
export async function lintFile(eslint, filePath) {
  const results = await eslint.lintFiles([filePath]);

  return results[0];
}
