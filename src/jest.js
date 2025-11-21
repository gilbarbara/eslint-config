import jest from 'eslint-plugin-jest';
import jestDom from 'eslint-plugin-jest-dom';
import globals from 'globals';

export default [
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/test/**/*.{js,jsx,ts,tsx}',
    ],
    plugins: {
      jest,
      'jest-dom': jestDom,
    },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      ...jest.configs['flat/style'].rules,
      ...jestDom.configs['flat/recommended'].rules,
    },
  },
];
