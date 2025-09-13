# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@gilbarbara/eslint-config`, a shared ESLint configuration package that provides consistent linting rules for JavaScript and TypeScript projects. The package exports multiple configurations for different use cases including base rules, React rules, and testing framework-specific rules.

## Package Commands

- **Test**: No test scripts are configured in this package
- **Lint**: Use the project's own ESLint configuration via `.eslintrc` which extends `./src/index.js`
- **Format**: Uses `@gilbarbara/prettier-config` for formatting (configured in package.json)
- **Publish**: Package is published to npm with version `0.8.8`

## Architecture

### Configuration Structure

The package follows a modular architecture with distinct configuration exports:

- **Main entry** (`src/index.js`): Combines base and React configurations
- **Base configuration** (`src/base.js`): Core rules for JavaScript/TypeScript without React
- **Specialized configs**: Jest, Vitest, Testing Library, React, and Type Checking configurations
- **Rules organization**: All custom rules are organized in `src/rules/` directory by category

### Configuration Composition

1. **Base Config** (`src/base.js`):
   - Contains comprehensive ESLint rules and Prettier integration
   - Includes rules from: core, import, stylistic, typescript, unicorn
   - Supports both JavaScript (Babel parser) and TypeScript overrides
   - Uses plugins: @babel, perfectionist, sort-destructure-keys, unicorn

2. **React Config** (`src/react.js`):
   - Contains React, React Hooks, and JSX A11y accessibility rules
   - Different rules for JS (prop-types warned) vs TS (prop-types disabled)
   - Includes React rules from `src/rules/react.js` and `src/rules/jsx-a11y.js`

3. **Testing Configs**:
   - **Jest**: Basic Jest and Jest DOM rules with environment settings
   - **Vitest**: Vitest-specific rules with legacy recommendations
   - **Testing Library**: Testing Library plugin rules
   - **Type Checking**: Strict TypeScript type-checking rules requiring tsconfig.json

### Export Pattern

The package.json exports field maps each configuration:
```
"." -> src/index.js (base + react)
"./base" -> src/base.js (no react)
"./jest" -> src/jest.js
"./react" -> src/react.js
"./testing-library" -> src/testing-library.js
"./type-checking" -> src/type-checking.js
"./vitest" -> src/vitest.js
```

### Rules Organization

Rules are categorized in `src/rules/`:

**Core Rules:**
- `core.js`: Core ESLint rules (~166 rules)
- `import.js`: Import/export rules from eslint-plugin-import
- `react.js`: React rules (~103 rules)
- `jsx-a11y.js`: JSX accessibility rules (~36 rules)

**Custom/Override Rules:**
- `base.js`: Core ESLint rule overrides
- `import.js`: Import/export related rule overrides
- `stylistic.js`: Code formatting and style rules
- `typescript.js`: TypeScript-specific rule overrides
- `unicorn.js`: Unicorn plugin rule configurations
- `react.js`: React-specific rule overrides

## Development Guidelines

### Adding New Rules
1. Identify the appropriate category (base, typescript, react, etc.)
2. Add rules to the corresponding file in `src/rules/`
3. Rules are automatically imported and applied via the main configuration files

### Testing Changes
- Use the `.eslintrc` file which extends the package's own configuration
- Test with various file types (.js, .jsx, .ts, .tsx) to ensure parser overrides work
- Verify peer dependencies are properly handled (Jest, Vitest, TypeScript, Prettier)

### Configuration Dependencies
- **Self-contained** - all rules are locally defined without external config dependencies
- All rules are defined in `src/rules/` files
- Integrates with Prettier via eslint-plugin-prettier
- Supports TypeScript via @typescript-eslint plugins
- Optional peer dependencies for testing frameworks

## Peer Dependencies

The package has optional peer dependencies:
- `jest: 29` (optional)
- `vitest: 2 || 3` (optional)  
- `prettier: 3` (required)
- `typescript: 5` (required for TS projects)

When adding new rules or plugins, ensure compatibility with these version ranges and mark testing framework dependencies as optional in peerDependenciesMeta.
