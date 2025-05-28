/**
 * Jest test setup file
 * Configures global test environment and mocks
 */

// Mock Electron APIs for testing
global.mockElectronAPI = {
  selectFolder: jest.fn(),
  transformImage: jest.fn(),
  getImageData: jest.fn()
};

// Mock window.electronAPI
Object.defineProperty(global, 'window', {
  value: {
    electronAPI: global.mockElectronAPI
  },
  writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock Sharp for image processing tests
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    rotate: jest.fn().mockReturnThis(),
    flip: jest.fn().mockReturnThis(),
    flop: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data')),
    metadata: jest.fn().mockResolvedValue({
      width: 1920,
      height: 1080,
      format: 'jpeg'
    })
  }));
  
  return mockSharp;
});

// Mock fs/promises for file system operations
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  stat: jest.fn(),
  access: jest.fn()
}));

// Setup and teardown
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});
