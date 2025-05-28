const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure API bridge for renderer process
 * Exposes limited functionality to maintain security
 */
const api = {
  /**
   * Select a folder containing images
   * @returns {Promise<Object>} Result object with success status and data
   */
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  /**
   * Apply transformations to an image
   * @param {string} imagePath - Path to the image file
   * @param {Object} transformations - Transformation data
   * @returns {Promise<Object>} Result object with success status
   */
  transformImage: (imagePath, transformations) => 
    ipcRenderer.invoke('transform-image', imagePath, transformations),

  /**
   * Get image data for display
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Result object with image data
   */
  getImageData: (imagePath) => 
    ipcRenderer.invoke('get-image-data', imagePath),

  /**
   * Platform information
   */
  platform: process.platform,

  /**
   * Application version
   */
  version: process.env.npm_package_version || '1.0.0'
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld('electronAPI', api);
  console.log('Preload script loaded successfully');
} catch (error) {
  console.error('Failed to expose API:', error);
}

// Handle any preload errors
window.addEventListener('error', (event) => {
  console.error('Preload error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Preload unhandled rejection:', event.reason);
});
