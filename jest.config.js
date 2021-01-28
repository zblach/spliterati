module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    'packages/',
  ],
  injectGlobals: true,
  transformIgnorePatterns: [
    '/node_modules/(?!constant-time-js)',
  ],
};
