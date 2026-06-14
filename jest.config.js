module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/eslint/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'eslint/plugins/*.js',
  ],
  coverageReporters: ['text', 'lcov'],
};
