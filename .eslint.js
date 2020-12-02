module.exports = {
  env: {
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsdoc/recommended',
    'plugin:unicorn/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.eslint.yml'],
    sourceType: 'module',
  },
  rules: {
    'unicorn/filename-case': [
      'warn',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: [
        "**/*.test.js",
      ],
      env: {
        jest: true,
      },
      plugins: ["jest"],
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error"
      }
    },
    Object.assign(
        {
          files: [ '**/*.test.js' ],
          env: { jest: true },
          plugins: [ 'jest' ],
        },
        require('eslint-plugin-jest').configs.recommended
    )
  ],
  plugins: ['@typescript-eslint', 'jsdoc', 'import', 'prefer-arrow', 'unicorn'],
};