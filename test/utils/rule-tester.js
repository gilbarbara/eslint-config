import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';

import plugin from '../../src/rules/react-kit/index.js';
import reactRules from '../../src/rules/react.js';

export const { rules } = plugin;

export const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

/** Case properties that parse the code as TSX. */
export const tsx = {
  filename: 'component.tsx',
  languageOptions: { parser: tseslint.parser },
};

/** This config's options for a @gilbarbara/* rule. */
export function configOptions(rule) {
  const [, ...options] = [reactRules[`@gilbarbara/${rule}`]].flat();

  return options;
}
