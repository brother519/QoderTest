module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        rootDir: '<rootDir>',
        baseUrl: '<rootDir>/src',
        paths: {
          'services/*': ['services/*'],
          'constants/*': ['constants/*'],
          'types/*': ['types/*']
        }
      }
    }
  }
};
