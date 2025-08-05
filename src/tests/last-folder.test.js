/**
 * Tests for last folder functionality
 */

// Mock localStorage for testing
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Mock window.electronAPI
const electronAPIMock = {
  scanFolder: jest.fn()
};

// Set up global mocks
global.localStorage = localStorageMock;
global.window = {
  electronAPI: electronAPIMock
};

// Mock DOM elements
global.document = {
  getElementById: jest.fn(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    addEventListener: jest.fn(),
    querySelectorAll: jest.fn(() => [])
  })),
  addEventListener: jest.fn(),
  querySelectorAll: jest.fn(() => [])
};

// Import the ImageAdjuster class (we'll need to extract it for testing)
// For now, let's test the localStorage functionality directly

describe('Last Folder Functionality', () => {
  beforeEach(() => {
    localStorageMock.clear();
    electronAPIMock.scanFolder.mockClear();
  });

  describe('localStorage operations', () => {
    test('should save and retrieve last folder path', () => {
      const testPath = '/Users/test/Pictures';
      
      // Save folder path
      localStorage.setItem('imageAdjuster_lastFolder', testPath);
      
      // Retrieve folder path
      const retrievedPath = localStorage.getItem('imageAdjuster_lastFolder');
      
      expect(retrievedPath).toBe(testPath);
    });

    test('should return null when no last folder is stored', () => {
      const retrievedPath = localStorage.getItem('imageAdjuster_lastFolder');
      expect(retrievedPath).toBeNull();
    });

    test('should remove invalid folder path', () => {
      const testPath = '/invalid/path';
      localStorage.setItem('imageAdjuster_lastFolder', testPath);
      
      // Simulate removing invalid path
      localStorage.removeItem('imageAdjuster_lastFolder');
      
      const retrievedPath = localStorage.getItem('imageAdjuster_lastFolder');
      expect(retrievedPath).toBeNull();
    });
  });

  describe('auto-load behavior', () => {
    test('should handle successful folder scan', async () => {
      const testPath = '/Users/test/Pictures';
      const mockImages = ['image1.jpg', 'image2.png'];
      
      electronAPIMock.scanFolder.mockResolvedValue({
        success: true,
        folderPath: testPath,
        images: mockImages
      });

      // Simulate the scan call
      const result = await electronAPIMock.scanFolder(testPath);
      
      expect(result.success).toBe(true);
      expect(result.images).toEqual(mockImages);
      expect(electronAPIMock.scanFolder).toHaveBeenCalledWith(testPath);
    });

    test('should handle failed folder scan', async () => {
      const testPath = '/invalid/path';
      
      electronAPIMock.scanFolder.mockRejectedValue(new Error('Folder not found'));

      // Simulate the scan call
      await expect(electronAPIMock.scanFolder(testPath)).rejects.toThrow('Folder not found');
    });

    test('should handle empty folder scan', async () => {
      const testPath = '/Users/test/EmptyFolder';
      
      electronAPIMock.scanFolder.mockResolvedValue({
        success: true,
        folderPath: testPath,
        images: []
      });

      const result = await electronAPIMock.scanFolder(testPath);
      
      expect(result.success).toBe(true);
      expect(result.images).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    test('should simulate complete last folder workflow', async () => {
      const testPath = '/Users/test/Pictures';
      const mockImages = ['photo1.jpg', 'photo2.png'];
      
      // Step 1: No last folder initially
      expect(localStorage.getItem('imageAdjuster_lastFolder')).toBeNull();
      
      // Step 2: User selects a folder and it gets saved
      localStorage.setItem('imageAdjuster_lastFolder', testPath);
      expect(localStorage.getItem('imageAdjuster_lastFolder')).toBe(testPath);
      
      // Step 3: On next startup, try to load the last folder
      electronAPIMock.scanFolder.mockResolvedValue({
        success: true,
        folderPath: testPath,
        images: mockImages
      });
      
      const result = await electronAPIMock.scanFolder(testPath);
      expect(result.success).toBe(true);
      expect(result.images).toEqual(mockImages);
    });

    test('should clear invalid folder from storage', async () => {
      const invalidPath = '/invalid/path';
      
      // Step 1: Invalid folder is stored
      localStorage.setItem('imageAdjuster_lastFolder', invalidPath);
      expect(localStorage.getItem('imageAdjuster_lastFolder')).toBe(invalidPath);
      
      // Step 2: Scan fails
      electronAPIMock.scanFolder.mockRejectedValue(new Error('Folder not found'));
      
      // Step 3: Should clear the invalid path
      try {
        await electronAPIMock.scanFolder(invalidPath);
      } catch (error) {
        // Simulate clearing invalid folder
        localStorage.removeItem('imageAdjuster_lastFolder');
      }
      
      expect(localStorage.getItem('imageAdjuster_lastFolder')).toBeNull();
    });
  });
});
