module.exports = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
  testEnvironment: 'jsdom',
  // Exclude config files from being treated as test files
  testPathIgnorePatterns: [
    'node_modules/',
    '__tests__/jest.config.js',
    '__tests__/jest.setup.js'
  ]
};
