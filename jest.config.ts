import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/lib/calc/types.ts',
    '!src/lib/store/repository.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 70,
      functions: 80,
      statements: 80,
    },
  },
};

export default config;
