import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * Image service for handling image operations
 */
class ImageService {
  constructor() {
    // Supported image formats
    this.supportedFormats = [
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'
    ];
  }

  /**
   * Recursively scan a folder for image files
   * @param {string} folderPath - Path to the folder to scan
   * @returns {Promise<Array>} Array of image file paths
   */
  async scanFolder(folderPath) {
    try {
      const images = [];
      await this._scanDirectory(folderPath, images);
      
      // Sort images by filename for consistent ordering
      images.sort((a, b) => {
        const nameA = path.basename(a).toLowerCase();
        const nameB = path.basename(b).toLowerCase();
        return nameA.localeCompare(nameB);
      });

      return images;
    } catch (error) {
      console.error('Error scanning folder:', error);
      throw new Error(`Failed to scan folder: ${error.message}`);
    }
  }

  /**
   * Recursively scan directory for images
   * @param {string} dirPath - Directory path to scan
   * @param {Array} images - Array to collect image paths
   * @private
   */
  async _scanDirectory(dirPath, images) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          await this._scanDirectory(fullPath, images);
        } else if (entry.isFile()) {
          // Check if file is a supported image format
          const ext = path.extname(entry.name).toLowerCase();
          if (this.supportedFormats.includes(ext)) {
            images.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Log error but continue scanning other directories
      console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Apply transformations to an image
   * @param {string} imagePath - Path to the image file
   * @param {Object} transformations - Transformation data
   * @returns {Promise<void>}
   */
  async applyTransformations(imagePath, transformations) {
    try {
      // Validate image path
      await this._validateImagePath(imagePath);

      let image = sharp(imagePath);

      // Apply rotations
      if (transformations.rotation && transformations.rotation !== 0) {
        image = image.rotate(transformations.rotation);
      }

      // Apply vertical flip
      if (transformations.flipVertical) {
        image = image.flip();
      }

      // Apply horizontal flip
      if (transformations.flipHorizontal) {
        image = image.flop();
      }

      // Save the transformed image, overwriting the original
      await image.toFile(imagePath);

      console.log(`Applied transformations to: ${imagePath}`);
    } catch (error) {
      console.error('Error applying transformations:', error);
      throw new Error(`Failed to transform image: ${error.message}`);
    }
  }

  /**
   * Get image data for display
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Image metadata and data
   */
  async getImageData(imagePath) {
    try {
      // Validate image path
      await this._validateImagePath(imagePath);

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Get file stats
      const stats = await fs.stat(imagePath);

      return {
        path: imagePath,
        filename: path.basename(imagePath),
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        modified: stats.mtime,
        // Convert image to base64 for display (for smaller images)
        dataUrl: await this._getImageDataUrl(imagePath, metadata)
      };
    } catch (error) {
      console.error('Error getting image data:', error);
      throw new Error(`Failed to get image data: ${error.message}`);
    }
  }

  /**
   * Convert image to data URL for display
   * @param {string} imagePath - Path to the image file
   * @param {Object} metadata - Image metadata
   * @returns {Promise<string>} Data URL
   * @private
   */
  async _getImageDataUrl(imagePath, metadata) {
    try {
      // For large images, create a thumbnail
      const maxSize = 1920; // Max width/height for display
      let image = sharp(imagePath);

      if (metadata.width > maxSize || metadata.height > maxSize) {
        image = image.resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      const buffer = await image.toBuffer();
      const base64 = buffer.toString('base64');
      const mimeType = this._getMimeType(metadata.format);

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error creating data URL:', error);
      // Return file path as fallback
      return `file://${imagePath}`;
    }
  }

  /**
   * Get MIME type for image format
   * @param {string} format - Image format
   * @returns {string} MIME type
   * @private
   */
  _getMimeType(format) {
    const mimeTypes = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      tiff: 'image/tiff',
      tif: 'image/tiff'
    };

    return mimeTypes[format?.toLowerCase()] || 'image/jpeg';
  }

  /**
   * Validate image path exists and is accessible
   * @param {string} imagePath - Path to validate
   * @returns {Promise<void>}
   * @private
   */
  async _validateImagePath(imagePath) {
    try {
      const stats = await fs.stat(imagePath);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }
    } catch (error) {
      throw new Error(`Invalid image path: ${error.message}`);
    }
  }

  /**
   * Check if a file is a supported image format
   * @param {string} filePath - Path to the file
   * @returns {boolean} True if supported
   */
  isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  /**
   * Get supported image formats
   * @returns {Array<string>} Array of supported extensions
   */
  getSupportedFormats() {
    return [...this.supportedFormats];
  }
}

// Export singleton instance
export default new ImageService();
