/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Reduce unnecessary process spawning
  maxWorkers: '50%',
  
  // Performance and memory optimizations
  cache: true,
  clearMocks: true,
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov'],
  
  // Ignore specific paths
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Environment variables for tests
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  },

  // Reduce potential memory leaks
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
