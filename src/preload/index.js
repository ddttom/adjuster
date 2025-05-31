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
   * Scan folder for images
   * @param {string} folderPath - Path to the folder to scan
   * @returns {Promise<Object>} Result object with images array
   */
  scanFolder: (folderPath) => 
    ipcRenderer.invoke('scan-folder', folderPath),

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
   * Delete an image file
   * @param {string} imagePath - Path to the image file to delete
   * @returns {Promise<Object>} Result object with success status
   */
  deleteImage: (imagePath) => 
    ipcRenderer.invoke('delete-image', imagePath),

  /**
   * Get image metadata including star rating
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Result object with metadata
   */
  getImageMetadata: (imagePath) => 
    ipcRenderer.invoke('get-image-metadata', imagePath),

  /**
   * Set star rating for an image
   * @param {string} imagePath - Path to the image file
   * @param {number} rating - Star rating (0-5)
   * @returns {Promise<Object>} Result object with success status
   */
  setImageRating: (imagePath, rating) => 
    ipcRenderer.invoke('set-image-rating', imagePath, rating),

  /**
   * Get rating from sidecar file
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Result object with rating
   */
  getRatingFromSidecar: (imagePath) => 
    ipcRenderer.invoke('get-rating-from-sidecar', imagePath),

  

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
