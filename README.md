# @gilbarbara/eslint-config

[![npm version](https://badge.fury.io/js/%40gilbarbara%2Feslint-config.svg)](https://badge.fury.io/js/%40gilbarbara%2Feslint-config)

Opinionated [ESLint](https://eslint.org/) configuration for modern projects.

Includes rules for React, TypeScript, accessibility (jsx-a11y-x), import/export, code organization (perfectionist), promises, regular expressions, and best practices (unicorn).

## Requirements

- Node.js 22.13+ or 24+
- ESLint 10.4+
- Prettier 3
- TypeScript 5 or 6.0 (for TS projects)

## Setup

Install the package (ESLint is bundled):

```sh
npm install -D eslint prettier @gilbarbara/eslint-config
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

export default [...base, ...node, ...vitest];
```

#### Exports

**@gilbarbara/eslint-config**  
Includes the `base` and `react` rules.

**@gilbarbara/eslint-config/base**  
Includes core ESLint rules, [Import](https://www.npmjs.com/package/eslint-plugin-import-x), [Perfectionist](https://github.com/azat-io/eslint-plugin-perfectionist), [Prettier](https://www.npmjs.com/package/eslint-plugin-prettier), [Promise](https://www.npmjs.com/package/eslint-plugin-promise), [Regexp](https://www.npmjs.com/package/eslint-plugin-regexp), [Sort Destructure Keys](https://www.npmjs.com/package/eslint-plugin-sort-destructure-keys), [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin), [Unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn), and [Unused Imports](https://www.npmjs.com/package/eslint-plugin-unused-imports) rules.

**@gilbarbara/eslint-config/node**  
Includes [Node.js](https://www.npmjs.com/package/eslint-plugin-n) rules for Node.js-specific best practices, deprecated APIs, and promise-based APIs.

**@gilbarbara/eslint-config/react**  
Includes [ESLint React](https://eslint-react.xyz), [React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks), [React Refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh), and [JSX A11y X](https://www.npmjs.com/package/eslint-plugin-jsx-a11y-x) accessibility rules, plus JSX rules from [Stylistic](https://eslint.style) and custom rules under the `@gilbarbara/` prefix.

**@gilbarbara/eslint-config/vitest**  
Includes [Vitest](https://www.npmjs.com/package/@vitest/eslint-plugin) rules.

**@gilbarbara/eslint-config/testing-library**  
Includes [Testing Library](https://www.npmjs.com/package/eslint-plugin-testing-library) rules.

**@gilbarbara/eslint-config/type-checking**  
Includes [TypeScript](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin) strict type-checking rules.

[Read more on flat config.](https://eslint.org/docs/latest/use/configure/configuration-files)

## Migrating from 1.x

### Requirements

- Upgrade to Node.js 22.13+ or 24+.
- Upgrade to ESLint 10.4+. ESLint 9 is not supported.
- Use TypeScript 5 or 6.0. TypeScript 6.1+ and 7 are not supported.

### Parser

`.js` and `.jsx` files use ESLint's default parser (`ecmaVersion: 'latest'`) instead of `@babel/eslint-parser`, and your Babel config is no longer read. Syntax that needs a Babel plugin (decorators, Flow, proposals) no longer parses: set a parser for those files in your own config.

The `@babel` plugin is no longer registered. Remove any `@babel/*` rules from your config.

### Renamed rules

Update rule overrides and `eslint-disable` comments:

| 1.x | 2.0 |
| --- | --- |
| `jsx-a11y/*` | `jsx-a11y-x/*` |
| `unicorn/prevent-abbreviations` | `unicorn/name-replacements` |
| `react/self-closing-comp` | `@stylistic/jsx-self-closing-comp` |
| `react/jsx-curly-brace-presence` | `@stylistic/jsx-curly-brace-presence` |
| `react/jsx-pascal-case` | `@stylistic/jsx-pascal-case` |
| `react/jsx-sort-props` | `perfectionist/sort-jsx-props` |
| `react/destructuring-assignment` | `@gilbarbara/destructuring-assignment` |
| `react/function-component-definition` | `@gilbarbara/function-component-definition` |
| `react/jsx-boolean-value` | `@gilbarbara/jsx-boolean-value` |
| `react/jsx-no-bind` | `@gilbarbara/jsx-no-bind` |
| `react/jsx-no-duplicate-props` | `@gilbarbara/jsx-no-duplicate-props` |
| `react/jsx-no-undef` | `@gilbarbara/jsx-no-undef` |
| `react/no-array-index-key` | `@eslint-react/no-array-index-key` |
| `react/no-object-type-as-default-prop` | `@eslint-react/no-unstable-default-props` |
| `react/no-unstable-nested-components` | `@eslint-react/no-nested-component-definitions` |
| `react/jsx-no-constructed-context-values` | `@eslint-react/no-unstable-context-value` |
| `react/no-deprecated` | `@eslint-react/dom-no-render`, `@eslint-react/dom-no-hydrate`, `@eslint-react/no-component-will-mount`, `@eslint-react/no-component-will-receive-props`, `@eslint-react/no-component-will-update` |
| `react/no-children-prop` | `@eslint-react/jsx-no-children-prop` |
| `react/no-namespace` | `@eslint-react/jsx-no-namespace` |
| `react/jsx-no-comment-textnodes` | `@eslint-react/jsx-no-comment-textnodes` |
| `react/jsx-no-useless-fragment` | `@eslint-react/jsx-no-useless-fragment` |
| `react/button-has-type` | `@eslint-react/dom-no-missing-button-type` |
| `react/iframe-missing-sandbox` | `@eslint-react/dom-no-missing-iframe-sandbox`, `@eslint-react/dom-no-unsafe-iframe-sandbox` |
| `react/jsx-no-script-url` | `@eslint-react/dom-no-script-url` |
| `react/jsx-no-target-blank` | `@eslint-react/dom-no-unsafe-target-blank` |
| `react/no-danger` | `@eslint-react/dom-no-dangerously-set-innerhtml` |
| `react/no-danger-with-children` | `@eslint-react/dom-no-dangerously-set-innerhtml-with-children` |
| `react/no-find-dom-node` | `@eslint-react/dom-no-find-dom-node` |
| `react/no-render-return-value` | `@eslint-react/dom-no-render-return-value` |
| `react/no-unknown-property` | `@eslint-react/dom-no-unknown-property` |
| `react/style-prop-object` | `@eslint-react/dom-no-string-style-prop` |
| `react/void-dom-elements-no-children` | `@eslint-react/dom-no-void-elements-with-children` |

The `@gilbarbara/*` rules take the same options as the `eslint-plugin-react` rules they replace, with the same defaults. Keep the options when renaming an override.

### Removed rules

- `react/no-invalid-html-attribute`, `react/no-this-in-sfc`
- `jsx-a11y/no-onchange`
- `unicorn/better-regex`

`unicorn/prefer-ternary` is now off.

`eslint-plugin-react` is no longer included. Replace any other `react/*` rule in your config with its [ESLint React](https://eslint-react.xyz/docs/rules) equivalent, and move `settings.react` to `settings['react-x']`.

### Behavior changes

The ESLint React replacements no longer report:

- `type="reset"` or an invalid `type` on buttons
- non-string `style` values, or `style` strings on components
- `target="_blank"` links with a dynamic `href`
- invalid `sandbox` values on iframes
- `ReactDOM.unmountComponentAtNode` and `ReactDOMServer.renderToNodeStream`

The `@gilbarbara/*` rules differ from `eslint-plugin-react`:

- `function-component-definition` reports but doesn't fix a component when the fix would drop a comment or another declarator, change what `this`, `arguments`, `super` or `new.target` refer to, or move a declaration below a use of it.
- `destructuring-assignment` also reports `props = {}` parameters and classes extending a renamed `Component` import.
- `jsx-no-bind` also reports `x?.bind()`.

JSX props sort in natural, case-insensitive order (`item2` before `item10`, `Alpha` between lowercase names). `children`, `dangerouslySetInnerHTML`, `key` and `ref` still come first, on components as well as DOM elements. Run `eslint --fix` to reorder existing props.

---

This configuration is intended to provide consistent rules and pairs well with the [@gilbarbara/prettier-config](https://github.com/gilbarbara/prettier-config) package.
