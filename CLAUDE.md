# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@gilbarbara/eslint-config`, a shared ESLint 9 flat config package that provides consistent linting rules for JavaScript and TypeScript projects. The package exports multiple configurations for different use cases including base rules, React rules, Node.js rules, and testing framework-specific rules.

## Requirements

- Node.js 20+
- ESLint 9+
- Prettier 3
- TypeScript 5 (for TS projects)

## Package Commands

- **Lint**: `npm run lint` - Lints src and test directories using `eslint.config.js`
- **Test**: `npm test` - Runs Vitest tests
- **Test with coverage**: `npm run test:coverage`
- **Validate**: `npm run validate` - Runs lint + test:coverage
- **Format**: Uses `@gilbarbara/prettier-config` (configured in package.json)

## Architecture

### Configuration Structure

The package follows a modular architecture with ESLint 9 flat config format:

- **Main entry** (`src/index.js`): Combines base and React configurations
- **Base configuration** (`src/base.js`): Core rules for JavaScript/TypeScript without React
- **Node.js configuration** (`src/node.js`): Node.js-specific rules
- **React configuration** (`src/react.js`): React, hooks, and accessibility rules
- **Testing configs**: Jest, Vitest, Testing Library
- **Type Checking** (`src/type-checking.js`): Strict TypeScript rules
- **Rules organization**: All custom rules are organized in `src/rules/` directory

### Configuration Composition

1. **Base Config** (`src/base.js`):
   - Contains comprehensive ESLint rules and Prettier integration
   - Includes rules from: core, import-x, stylistic, typescript, unicorn, promise, regexp
   - Supports both JavaScript (Babel parser) and TypeScript overrides
   - Uses plugins: @babel, import-x, perfectionist, promise, regexp, sort-destructure-keys, unicorn, unused-imports

2. **React Config** (`src/react.js`):
   - Contains React, React Hooks, React Compiler, React Refresh, and JSX A11y rules
   - Different rules for JS (prop-types warned) vs TS (prop-types disabled)
   - Uses plugins: react, react-compiler, react-hooks, react-refresh, jsx-a11y

3. **Node.js Config** (`src/node.js`):
   - Node.js-specific rules for deprecated APIs, path handling, promises
   - Uses plugin: eslint-plugin-n

4. **Testing Configs**:
   - **Jest**: Jest and Jest DOM rules with environment settings
   - **Vitest**: Vitest-specific rules
   - **Testing Library**: Testing Library plugin rules
   - **Type Checking**: Strict TypeScript type-checking rules requiring tsconfig.json

### Export Pattern

The package.json exports field maps each configuration:
```
"." -> src/index.js (base + react)
"./base" -> src/base.js (no react)
"./jest" -> src/jest.js
"./node" -> src/node.js
"./react" -> src/react.js
"./testing-library" -> src/testing-library.js
"./type-checking" -> src/type-checking.js
"./vitest" -> src/vitest.js
```

### Rules Organization

Rules are categorized in `src/rules/`:

- `core.js`: Core ESLint rules
- `import.js`: Import/export rules (eslint-plugin-import-x)
- `jsx-a11y.js`: JSX accessibility rules
- `node.js`: Node.js-specific rules
- `promise.js`: Promise handling rules
- `react.js`: React rules
- `regexp.js`: Regular expression rules
- `stylistic.js`: Code formatting and style rules
- `typescript.js`: TypeScript-specific rules
- `unicorn.js`: Unicorn plugin rules

## Development Guidelines

### Adding New Rules
1. Identify the appropriate category (base, typescript, react, node, etc.)
2. Add rules to the corresponding file in `src/rules/`
3. Import and apply rules in the main configuration file
4. Add tests for the new rules

### Testing Changes
- Uses `eslint.config.js` (ESLint 9 flat config format)
- Run `npm test` to execute all tests
- Run `npm run validate` for full lint + test validation
- Test fixtures are in `test/fixtures/`
- Unit tests check config structure, integration tests run ESLint on fixtures

### Adding New Plugins
1. Install the plugin: `pnpm add eslint-plugin-xxx`
2. Create rules file in `src/rules/xxx.js`
3. Import and configure in the appropriate config file
4. Add unit tests for plugin presence and rule configuration
5. Add integration test with fixture demonstrating rule detection
6. Update README.md exports section

## Peer Dependencies

The package has optional peer dependencies:
- `jest: 29 || 30` (optional)
- `vitest: 2 || 3 || 4` (optional)
- `prettier: 3` (required)
- `typescript: 5` (required for TS projects)

When adding new rules or plugins, ensure compatibility with these version ranges and mark testing framework dependencies as optional in peerDependenciesMeta.
