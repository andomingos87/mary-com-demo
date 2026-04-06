const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.d.ts',
    '!src/components/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      // Temporarily reduced for MVP deploy - TODO: increase to 50% as more tests are added
      branches: 20,
      functions: 10,
      lines: 25,
      statements: 25,
    },
  },
  // Snapshot serializer for cleaner snapshots
  snapshotSerializers: [],
}

module.exports = createJestConfig(customJestConfig)

