import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import exifr from 'exifr';

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
   * @returns {Promise<Array>} Array of image file paths sorted by filename
   */
  async scanFolder(folderPath) {
    const startTime = Date.now();
    console.log(`🔍 SCAN FOLDER START: ${folderPath}`);
    
    try {
      const images = [];
      console.log(`   📂 Starting directory scan...`);
      await this._scanDirectory(folderPath, images);
      
      console.log(`   📊 Raw scan results: ${images.length} images found`);
      if (images.length > 0) {
        console.log(`   📋 First few images:`, images.slice(0, 5).map(img => path.basename(img)));
      }
      
      // Sort by filename (natural alphabetical order)
      console.log(`   🔄 Sorting images by filename...`);
      images.sort((a, b) => {
        const filenameA = path.basename(a).toLowerCase();
        const filenameB = path.basename(b).toLowerCase();
        return filenameA.localeCompare(filenameB, undefined, { numeric: true });
      });

      const duration = Date.now() - startTime;
      console.log(`✅ SCAN FOLDER SUCCESS: ${folderPath}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🖼️  Total images: ${images.length}`);
      console.log(`   📁 Supported formats: ${this.supportedFormats.join(', ')}`);

      return images;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ SCAN FOLDER ERROR: ${folderPath}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
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
    console.log(`   📂 Scanning directory: ${dirPath}`);
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      console.log(`   📋 Found ${entries.length} entries in ${path.basename(dirPath)}`);

      let fileCount = 0;
      let dirCount = 0;
      let imageCount = 0;

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          dirCount++;
          console.log(`   📁 Subdirectory: ${entry.name}`);
          // Recursively scan subdirectories
          await this._scanDirectory(fullPath, images);
        } else if (entry.isFile()) {
          fileCount++;
          // Check if file is a supported image format
          const ext = path.extname(entry.name).toLowerCase();
          console.log(`   📄 File: ${entry.name} (ext: ${ext})`);
          
          if (this.supportedFormats.includes(ext)) {
            imageCount++;
            images.push(fullPath);
            console.log(`   ✅ Added image: ${entry.name}`);
          } else {
            console.log(`   ❌ Skipped (unsupported): ${entry.name}`);
          }
        }
      }

      console.log(`   📊 Directory summary for ${path.basename(dirPath)}: ${fileCount} files, ${dirCount} subdirs, ${imageCount} images added`);
      
    } catch (error) {
      // Log error but continue scanning other directories
      console.warn(`⚠️  Warning: Could not scan directory ${dirPath}:`, error.message);
    }
  }

  /**
   * Apply transformations to an image
   * @param {string} imagePath - Path to the image file
   * @param {Object} transformations - Transformation data
   * @returns {Promise<void>}
   */
  async applyTransformations(imagePath, transformations) {
    const startTime = Date.now();
    const fileName = path.basename(imagePath);
    
    try {
      // Log transformation start
      console.log(`🔄 TRANSFORM START: ${fileName}`);
      console.log(`   📁 Path: ${imagePath}`);
      console.log(`   🔧 Transformations:`, {
        rotation: transformations.rotation || 0,
        flipVertical: transformations.flipVertical || false,
        flipHorizontal: transformations.flipHorizontal || false
      });

      // Validate image path
      await this._validateImagePath(imagePath);

      let image = sharp(imagePath);
      const appliedTransforms = [];

      // Apply rotations
      if (transformations.rotation && transformations.rotation !== 0) {
        image = image.rotate(transformations.rotation);
        appliedTransforms.push(`rotate ${transformations.rotation}°`);
        console.log(`   ↻ Applied rotation: ${transformations.rotation}°`);
      }

      // Apply vertical flip
      if (transformations.flipVertical) {
        image = image.flip();
        appliedTransforms.push('flip vertical');
        console.log(`   ⇅ Applied vertical flip`);
      }

      // Apply horizontal flip
      if (transformations.flipHorizontal) {
        image = image.flop();
        appliedTransforms.push('flip horizontal');
        console.log(`   ⇄ Applied horizontal flip`);
      }

      // Create temporary file path
      const tempPath = imagePath + '.tmp';
      
      console.log(`   💾 Saving to temporary file: ${path.basename(tempPath)}`);
      
      // Save to temporary file first
      await image.toFile(tempPath);
      
      console.log(`   🔄 Replacing original file`);
      
      // Replace original file with transformed version
      await fs.rename(tempPath, imagePath);

      const duration = Date.now() - startTime;
      console.log(`✅ TRANSFORM SUCCESS: ${fileName}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🎯 Applied: ${appliedTransforms.join(', ') || 'none'}`);
      console.log(`   📊 File saved successfully`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ TRANSFORM ERROR: ${fileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      // Clean up temporary file if it exists
      try {
        await fs.unlink(imagePath + '.tmp');
        console.log(`   🧹 Cleaned up temporary file`);
      } catch (cleanupError) {
        console.warn(`   ⚠️  Could not clean up temporary file: ${cleanupError.message}`);
      }
      
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
   * Get image metadata including star rating
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Metadata object with rating, dates, etc.
   */
  async getImageMetadata(imagePath) {
    const startTime = Date.now();
    const fileName = path.basename(imagePath);
    
    try {
      console.log(`📊 METADATA READ: ${fileName}`);
      
      // Get file stats for dates
      const stats = await fs.stat(imagePath);
      
      // Read EXIF/XMP data
      const exifData = await exifr.parse(imagePath, {
        userComment: true,
        xmp: true,
        icc: false,
        iptc: false,
        jfif: false,
        ihdr: false
      });
      
      // Extract star rating from sidecar file first, then fallback to EXIF
      let rating = 0;
      
      // Check for sidecar rating file first
      const ratingFile = imagePath + '.rating';
      try {
        const ratingContent = await fs.readFile(ratingFile, 'utf8');
        rating = parseInt(ratingContent.trim(), 10) || 0;
        console.log(`   📄 Found sidecar rating file: ${rating}`);
      } catch (sidecarError) {
        console.log(`   📄 No sidecar rating file found`);
        
        // Fallback to EXIF data
        if (exifData) {
          console.log(`   🔍 Available EXIF fields:`, Object.keys(exifData));
          
          // Try standard Rating field first
          if (exifData.Rating) {
            rating = parseInt(exifData.Rating, 10) || 0;
            console.log(`   📊 Found Rating field: ${rating}`);
          }
          
          // Try UserComment field (our custom format)
          if (rating === 0 && exifData.UserComment && typeof exifData.UserComment === 'string') {
            console.log(`   📝 UserComment: "${exifData.UserComment}"`);
            const match = exifData.UserComment.match(/rating:(\d)/);
            if (match) {
              rating = parseInt(match[1], 10);
              console.log(`   📊 Found rating in UserComment: ${rating}`);
            }
          }
          
          // Try IFD0 Rating field
          if (rating === 0 && exifData.IFD0 && exifData.IFD0.Rating) {
            rating = parseInt(exifData.IFD0.Rating, 10) || 0;
            console.log(`   📊 Found IFD0 Rating: ${rating}`);
          }
          
          // Try IFD0 UserComment field
          if (rating === 0 && exifData.IFD0 && exifData.IFD0.UserComment && typeof exifData.IFD0.UserComment === 'string') {
            console.log(`   📝 IFD0 UserComment: "${exifData.IFD0.UserComment}"`);
            const match = exifData.IFD0.UserComment.match(/rating:(\d)/);
            if (match) {
              rating = parseInt(match[1], 10);
              console.log(`   📊 Found rating in IFD0 UserComment: ${rating}`);
            }
          }
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ METADATA READ SUCCESS: ${fileName}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   ⭐ Rating: ${rating}`);
      
      return {
        rating: Math.max(0, Math.min(5, rating)), // Clamp to 0-5
        dateModified: stats.mtime,
        dateCreated: stats.birthtime || stats.mtime,
        size: stats.size
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ METADATA READ ERROR: ${fileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      // Return default metadata on error
      const stats = await fs.stat(imagePath);
      return {
        rating: 0,
        dateModified: stats.mtime,
        dateCreated: stats.birthtime || stats.mtime,
        size: stats.size
      };
    }
  }

  /**
   * Set star rating for an image
   * @param {string} imagePath - Path to the image file
   * @param {number} rating - Star rating (0-5)
   * @returns {Promise<void>}
   */
  async setImageRating(imagePath, rating) {
    const startTime = Date.now();
    const fileName = path.basename(imagePath);
    
    try {
      console.log(`⭐ RATING SET: ${fileName}`);
      console.log(`   📁 Path: ${imagePath}`);
      console.log(`   ⭐ Rating: ${rating}`);
      
      // Validate rating
      const validRating = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
      
      // Use a simpler approach - store rating in a sidecar file
      // This avoids the complexity of EXIF metadata writing which can be unreliable
      const ratingFile = imagePath + '.rating';
      
      console.log(`   📝 Writing rating to sidecar file: ${ratingFile}`);
      console.log(`   ⭐ Rating value: ${validRating}`);
      
      // Write rating to a simple text file
      await fs.writeFile(ratingFile, validRating.toString(), 'utf8');
      
      const duration = Date.now() - startTime;
      console.log(`✅ RATING SET SUCCESS: ${fileName}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   ⭐ Rating saved: ${validRating}`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ RATING SET ERROR: ${fileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(imagePath + '.rating.tmp');
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      throw new Error(`Failed to set rating: ${error.message}`);
    }
  }

  

  /**
   * Delete an image file
   * @param {string} imagePath - Path to the image file to delete
   * @returns {Promise<void>}
   */
  async deleteImage(imagePath) {
    const startTime = Date.now();
    const fileName = path.basename(imagePath);
    
    try {
      console.log(`🗑️  DELETE START: ${fileName}`);
      console.log(`   📁 Path: ${imagePath}`);
      
      // Validate image path first
      await this._validateImagePath(imagePath);
      
      // Delete the file
      await fs.unlink(imagePath);
      
      const duration = Date.now() - startTime;
      console.log(`✅ DELETE SUCCESS: ${fileName}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🗑️  File removed from disk`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ DELETE ERROR: ${fileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Get rating from sidecar file only (for performance)
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<number>} Rating (0-5)
   */
  async getRatingFromSidecar(imagePath) {
    try {
      const ratingFile = imagePath + '.rating';
      const ratingContent = await fs.readFile(ratingFile, 'utf8');
      const rating = parseInt(ratingContent.trim(), 10) || 0;
      return Math.max(0, Math.min(5, rating)); // Clamp to 0-5
    } catch (error) {
      // No sidecar file or error reading it
      return 0;
    }
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
