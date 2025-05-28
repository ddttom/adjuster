/**
 * Tests for Image Service
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import imageService from '../services/image-service.js';

// Mock the fs and sharp modules
jest.mock('fs/promises');
jest.mock('sharp');

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scanFolder', () => {
    it('should scan folder and return sorted image files', async () => {
      // Mock directory structure
      const mockEntries = [
        { name: 'image1.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'image2.png', isDirectory: () => false, isFile: () => true },
        { name: 'document.txt', isDirectory: () => false, isFile: () => true },
        { name: 'subfolder', isDirectory: () => true, isFile: () => false }
      ];

      const mockSubEntries = [
        { name: 'image3.gif', isDirectory: () => false, isFile: () => true }
      ];

      fs.readdir
        .mockResolvedValueOnce(mockEntries)
        .mockResolvedValueOnce(mockSubEntries);

      const result = await imageService.scanFolder('/test/folder');

      expect(result).toEqual([
        '/test/folder/image1.jpg',
        '/test/folder/image2.png',
        '/test/folder/subfolder/image3.gif'
      ]);
      expect(fs.readdir).toHaveBeenCalledTimes(2);
    });

    it('should handle empty folders', async () => {
      fs.readdir.mockResolvedValue([]);

      const result = await imageService.scanFolder('/empty/folder');

      expect(result).toEqual([]);
    });

    it('should handle scan errors gracefully', async () => {
      fs.readdir.mockRejectedValue(new Error('Permission denied'));

      await expect(imageService.scanFolder('/restricted/folder'))
        .rejects.toThrow('Failed to scan folder');
    });

    it('should filter out non-image files', async () => {
      const mockEntries = [
        { name: 'image.jpg', isDirectory: () => false, isFile: () => true },
        { name: 'document.pdf', isDirectory: () => false, isFile: () => true },
        { name: 'video.mp4', isDirectory: () => false, isFile: () => true },
        { name: 'photo.png', isDirectory: () => false, isFile: () => true }
      ];

      fs.readdir.mockResolvedValue(mockEntries);

      const result = await imageService.scanFolder('/test/folder');

      expect(result).toEqual([
        '/test/folder/image.jpg',
        '/test/folder/photo.png'
      ]);
    });
  });

  describe('applyTransformations', () => {
    it('should apply rotation transformation', async () => {
      const mockSharpInstance = {
        rotate: jest.fn().mockReturnThis(),
        flip: jest.fn().mockReturnThis(),
        flop: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue()
      };

      sharp.mockReturnValue(mockSharpInstance);
      fs.stat.mockResolvedValue({ isFile: () => true });

      const transformations = { rotation: 90 };
      await imageService.applyTransformations('/test/image.jpg', transformations);

      expect(mockSharpInstance.rotate).toHaveBeenCalledWith(90);
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith('/test/image.jpg');
    });

    it('should apply flip transformations', async () => {
      const mockSharpInstance = {
        rotate: jest.fn().mockReturnThis(),
        flip: jest.fn().mockReturnThis(),
        flop: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue()
      };

      sharp.mockReturnValue(mockSharpInstance);
      fs.stat.mockResolvedValue({ isFile: () => true });

      const transformations = { 
        flipVertical: true, 
        flipHorizontal: true 
      };
      await imageService.applyTransformations('/test/image.jpg', transformations);

      expect(mockSharpInstance.flip).toHaveBeenCalled();
      expect(mockSharpInstance.flop).toHaveBeenCalled();
    });

    it('should handle transformation errors', async () => {
      sharp.mockImplementation(() => {
        throw new Error('Sharp processing error');
      });
      fs.stat.mockResolvedValue({ isFile: () => true });

      const transformations = { rotation: 90 };

      await expect(imageService.applyTransformations('/test/image.jpg', transformations))
        .rejects.toThrow('Failed to transform image');
    });

    it('should validate image path before transformation', async () => {
      fs.stat.mockRejectedValue(new Error('File not found'));

      const transformations = { rotation: 90 };

      await expect(imageService.applyTransformations('/invalid/path.jpg', transformations))
        .rejects.toThrow('Failed to transform image');
    });
  });

  describe('getImageData', () => {
    it('should return image metadata and data URL', async () => {
      const mockMetadata = {
        width: 1920,
        height: 1080,
        format: 'jpeg'
      };

      const mockStats = {
        size: 1024000,
        mtime: new Date('2023-01-01')
      };

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue(mockMetadata),
        resize: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data'))
      };

      sharp.mockReturnValue(mockSharpInstance);
      fs.stat.mockResolvedValue(mockStats);

      const result = await imageService.getImageData('/test/image.jpg');

      expect(result).toMatchObject({
        path: '/test/image.jpg',
        filename: 'image.jpg',
        width: 1920,
        height: 1080,
        format: 'jpeg',
        size: 1024000
      });
      expect(result.dataUrl).toContain('data:image/jpeg;base64,');
    });

    it('should handle large images by resizing', async () => {
      const mockMetadata = {
        width: 4000,
        height: 3000,
        format: 'png'
      };

      const mockSharpInstance = {
        metadata: jest.fn().mockResolvedValue(mockMetadata),
        resize: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('resized-image-data'))
      };

      sharp.mockReturnValue(mockSharpInstance);
      fs.stat.mockResolvedValue({ size: 5000000, mtime: new Date() });

      await imageService.getImageData('/test/large-image.png');

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      });
    });

    it('should handle image data errors gracefully', async () => {
      fs.stat.mockRejectedValue(new Error('File not found'));

      await expect(imageService.getImageData('/invalid/image.jpg'))
        .rejects.toThrow('Failed to get image data');
    });
  });

  describe('isImageFile', () => {
    it('should return true for supported image formats', () => {
      expect(imageService.isImageFile('test.jpg')).toBe(true);
      expect(imageService.isImageFile('test.PNG')).toBe(true);
      expect(imageService.isImageFile('test.gif')).toBe(true);
      expect(imageService.isImageFile('test.webp')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(imageService.isImageFile('test.txt')).toBe(false);
      expect(imageService.isImageFile('test.pdf')).toBe(false);
      expect(imageService.isImageFile('test.mp4')).toBe(false);
    });

    it('should handle files without extensions', () => {
      expect(imageService.isImageFile('filename')).toBe(false);
    });
  });

  describe('getSupportedFormats', () => {
    it('should return array of supported formats', () => {
      const formats = imageService.getSupportedFormats();
      
      expect(Array.isArray(formats)).toBe(true);
      expect(formats).toContain('.jpg');
      expect(formats).toContain('.png');
      expect(formats).toContain('.gif');
      expect(formats.length).toBeGreaterThan(0);
    });
  });
});
