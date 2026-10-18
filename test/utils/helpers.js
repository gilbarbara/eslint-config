import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createESLintWithConfig(configPath) {
  const module = await import(configPath);
  const config = module.default;

  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
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
 * Get config object matching a specific file pattern
 */
export function getConfigForFiles(configArray, filePattern) {
  if (!Array.isArray(configArray)) {
    return null;
  }

  return configArray.find(
    config => config.files && config.files.some(pattern => pattern.includes(filePattern)),
  );
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
 * Get a rule value from flat config array
 */
export function getRuleValue(configArray, ruleId) {
  if (!Array.isArray(configArray)) {
    return configArray.rules?.[ruleId];
  }

  for (const config of configArray) {
    if (config.rules?.[ruleId] !== undefined) {
      return config.rules[ruleId];
    }
  }

  return undefined;
}

/**
 * Get specific rule violations from lint results
 */
export function getViolationsForRule(lintResult, ruleId) {
  return lintResult.messages.filter(message => message.ruleId === ruleId);
}

/**
 * Check if a plugin is configured in flat config
 */
export function hasPlugin(configArray, pluginName) {
  if (!Array.isArray(configArray)) {
    return configArray.plugins && pluginName in configArray.plugins;
  }

  return configArray.some(config => config.plugins && pluginName in config.plugins);
}

/**
 * Check if a specific rule is configured in the flat config array
 */
export function isRuleConfigured(configArray, ruleId) {
  if (!Array.isArray(configArray)) {
    return configArray.rules && configArray.rules[ruleId] !== undefined;
  }

  return configArray.some(config => config.rules && config.rules[ruleId] !== undefined);
}

/**
 * Run ESLint on a file and return results
 */
export async function lintFile(eslint, filePath) {
  const results = await eslint.lintFiles([filePath]);

  return results[0];
}
