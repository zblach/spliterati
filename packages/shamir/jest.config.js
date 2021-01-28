module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  injectGlobals: true,
  transformIgnorePatterns: [
    '/node_modules/(?!constant-time-js)',
  ],
};
