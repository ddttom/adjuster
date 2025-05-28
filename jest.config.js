/**
 * Jest configuration for Image Adjuster
 */
export default {
  // Test environment
  testEnvironment: 'node',
  
  // Module system
  preset: 'es-modules',
  extensionsToTreatAsEsm: ['.js'],
  
  // Transform configuration
  transform: {},
  
  // Module name mapping
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  
  // Test file patterns
  testMatch: [
    '**/src/tests/**/*.test.js',
    '**/src/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/renderer/**',
    '!**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};
