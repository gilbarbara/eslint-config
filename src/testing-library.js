import testingLibrary from 'eslint-plugin-testing-library';

export default [
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/test/**/*.{js,jsx,ts,tsx}',
    ],
    ...testingLibrary.configs['flat/react'],
  },
];
