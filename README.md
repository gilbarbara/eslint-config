# @gilbarbara/eslint-config

[![npm version](https://badge.fury.io/js/%40gilbarbara%2Feslint-config.svg)](https://badge.fury.io/js/%40gilbarbara%2Feslint-config)

Opinionated [ESLint](https://eslint.org/) configuration for modern projects.

Includes rules for React, TypeScript, accessibility (jsx-a11y), import/export, code organization (perfectionist), and best practices (unicorn).


## Setup

Install the package:

```sh
$ npm install -D @gilbarbara/eslint-config prettier
```

Update your eslint configuration:

```json
{
  "extends": ["@gilbarbara/eslint-config"]
}
```

The default export contains most of the rules for ECMAScript 6+, TypeScript, and React.
If you don't need React, use `@gilbarbara/eslint-config/base`

#### Exports

**@gilbarbara/eslint-config**  
Includes the `base` and `react` rules.

**@gilbarbara/eslint-config/base**  
Includes core ESLint rules, [Import](https://www.npmjs.com/package/eslint-plugin-import), [Prettier](https://www.npmjs.com/package/eslint-plugin-prettier), [Perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist), [Sort Destructure Keys](https://www.npmjs.com/package/eslint-plugin-sort-destructure-keys), [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin), and [Unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn) rules.

**@gilbarbara/eslint-config/jest**  
Includes [Jest](https://www.npmjs.com/package/eslint-plugin-jest) and [Jest DOM](https://www.npmjs.com/package/eslint-plugin-jest-dom) rules.

**@gilbarbara/eslint-config/react**  
Includes [React](https://www.npmjs.com/package/eslint-plugin-react), [React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks), and [JSX A11y](https://www.npmjs.com/package/eslint-plugin-jsx-a11y) accessibility rules.

**@gilbarbara/eslint-config/testing-library**  
Includes [Testing Library](https://www.npmjs.com/package/eslint-plugin-testing-library) rules.

**@gilbarbara/eslint-config/type-checking**  
Includes [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin) strict type-checking rules.

**@gilbarbara/eslint-config/vitest**  
Includes [Vitest](https://www.npmjs.com/package/eslint-plugin-vitest) rules.

[Read more on shared configurations.](https://eslint.org/docs/latest/use/configure/configuration-files#extending-configuration-files)

---

This configuration is intended to provide consistent rules and pairs well with the [@gilbarbara/prettier-config](https://github.com/gilbarbara/prettier-config) package.
