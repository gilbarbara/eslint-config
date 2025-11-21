# @gilbarbara/eslint-config

[![npm version](https://badge.fury.io/js/%40gilbarbara%2Feslint-config.svg)](https://badge.fury.io/js/%40gilbarbara%2Feslint-config)

Opinionated [ESLint](https://eslint.org/) configuration for modern projects.

Includes rules for React, TypeScript, accessibility (jsx-a11y), import/export, code organization (perfectionist), promises, regular expressions, and best practices (unicorn).

## Requirements

- Node.js 20+
- ESLint 9+
- Prettier 3
- TypeScript 5 (for TS projects)

## Setup

Install the package (ESLint is bundled):

```sh
npm install -D @gilbarbara/eslint-config prettier
```

Create an `eslint.config.js` file:

```js
import config from '@gilbarbara/eslint-config';

export default config;
```

The default export includes base rules and React rules.

### Without React

```js
import base from '@gilbarbara/eslint-config/base';

export default base;
```

### Combining Configs

```js
import base from '@gilbarbara/eslint-config/base';
import node from '@gilbarbara/eslint-config/node';
import vitest from '@gilbarbara/eslint-config/vitest';

export default [
  ...base,
  ...node,
  ...vitest,
];
```

#### Exports

**@gilbarbara/eslint-config**  
Includes the `base` and `react` rules.

**@gilbarbara/eslint-config/base**  
Includes core ESLint rules, [Import](https://www.npmjs.com/package/eslint-plugin-import-x), [Perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist), [Prettier](https://www.npmjs.com/package/eslint-plugin-prettier), [Promise](https://www.npmjs.com/package/eslint-plugin-promise), [Regexp](https://www.npmjs.com/package/eslint-plugin-regexp), [Sort Destructure Keys](https://www.npmjs.com/package/eslint-plugin-sort-destructure-keys), [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin), [Unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn), and [Unused Imports](https://www.npmjs.com/package/eslint-plugin-unused-imports) rules.

**@gilbarbara/eslint-config/node**  
Includes [Node.js](https://www.npmjs.com/package/eslint-plugin-n) rules for Node.js-specific best practices, deprecated APIs, and promise-based APIs.

**@gilbarbara/eslint-config/react**  
Includes [React](https://www.npmjs.com/package/eslint-plugin-react), [React Compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler), [React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks), [React Refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh), and [JSX A11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) accessibility rules.

**@gilbarbara/eslint-config/vitest**  
Includes [Vitest](https://www.npmjs.com/package/@vitest/eslint-plugin) rules.

**@gilbarbara/eslint-config/jest**  
Includes [Jest](https://www.npmjs.com/package/eslint-plugin-jest) and [Jest DOM](https://www.npmjs.com/package/eslint-plugin-jest-dom) rules.

**@gilbarbara/eslint-config/testing-library**  
Includes [Testing Library](https://www.npmjs.com/package/eslint-plugin-testing-library) rules.

**@gilbarbara/eslint-config/type-checking**  
Includes [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin) strict type-checking rules.

[Read more on flat config.](https://eslint.org/docs/latest/use/configure/configuration-files)

---

This configuration is intended to provide consistent rules and pairs well with the [@gilbarbara/prettier-config](https://github.com/gilbarbara/prettier-config) package.
