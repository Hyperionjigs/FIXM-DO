const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/types.{js,jsx,ts,tsx}',
    '!src/**/constants.{js,jsx,ts,tsx}',
    '!src/**/utils.{js,jsx,ts,tsx}',
    '!src/**/helpers.{js,jsx,ts,tsx}',
    '!src/**/mocks.{js,jsx,ts,tsx}',
    '!src/**/fixtures.{js,jsx,ts,tsx}',
    '!src/**/test-utils.{js,jsx,ts,tsx}',
    '!src/**/test-helpers.{js,jsx,ts,tsx}',
    '!src/**/test-data.{js,jsx,ts,tsx}',
    '!src/**/test-mocks.{js,jsx,ts,tsx}',
    '!src/**/test-fixtures.{js,jsx,ts,tsx}',
    '!src/**/test-setup.{js,jsx,ts,tsx}',
    '!src/**/test-teardown.{js,jsx,ts,tsx}',
    '!src/**/test-utils.{js,jsx,ts,tsx}',
    '!src/**/test-helpers.{js,jsx,ts,tsx}',
    '!src/**/test-data.{js,jsx,ts,tsx}',
    '!src/**/test-mocks.{js,jsx,ts,tsx}',
    '!src/**/test-fixtures.{js,jsx,ts,tsx}',
    '!src/**/test-setup.{js,jsx,ts,tsx}',
    '!src/**/test-teardown.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  setupFiles: [],
  globalSetup: undefined,
  globalTeardown: undefined,
  reporters: [
    'default',
    'default',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig) 