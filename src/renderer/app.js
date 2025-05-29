/**
 * Image Adjuster - Main Application
 * Handles image viewing, editing, and navigation functionality
 */

class ImageAdjuster {
  constructor() {
    // Application state
    this.images = [];
    this.currentIndex = 0;
    this.currentFolder = '';
    this.pendingTransformations = {
      rotation: 0,
      flipVertical: false,
      flipHorizontal: false
    };

    // DOM elements
    this.elements = {};
    
    // Initialize application
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      this.initializeElements();
      this.attachEventListeners();
      this.setupKeyboardShortcuts();
      
      console.log('Image Adjuster initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to initialize application');
    }
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    // Screens
    this.elements.folderSelection = document.getElementById('folder-selection');
    this.elements.imageViewer = document.getElementById('image-viewer');

    // Folder selection
    this.elements.selectFolderBtn = document.getElementById('select-folder-btn');

    // Image display
    this.elements.currentImage = document.getElementById('current-image');
    this.elements.loadingIndicator = document.getElementById('loading-indicator');
    this.elements.errorMessage = document.getElementById('error-message');

    // Control buttons
    this.elements.prevBtn = document.getElementById('prev-btn');
    this.elements.nextBtn = document.getElementById('next-btn');
    this.elements.rotateLeftBtn = document.getElementById('rotate-left-btn');
    this.elements.rotateRightBtn = document.getElementById('rotate-right-btn');
    this.elements.flipVerticalBtn = document.getElementById('flip-vertical-btn');
    this.elements.flipHorizontalBtn = document.getElementById('flip-horizontal-btn');
    this.elements.deleteBtn = document.getElementById('delete-btn');
    this.elements.newFolderBtn = document.getElementById('new-folder-btn');

    // Status and info
    this.elements.imageCounter = document.getElementById('image-counter');
    this.elements.imageInfo = document.getElementById('image-info');
    this.elements.currentFolder = document.getElementById('current-folder');
    this.elements.pendingChanges = document.getElementById('pending-changes');
    this.elements.operationStatus = document.getElementById('operation-status');

    // Toasts
    this.elements.errorToast = document.getElementById('error-toast');
    this.elements.successToast = document.getElementById('success-toast');

    // Help
    this.elements.helpOverlay = document.getElementById('help-overlay');
    this.elements.closeHelp = document.getElementById('close-help');
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Folder selection
    this.elements.selectFolderBtn.addEventListener('click', () => this.selectFolder());
    this.elements.newFolderBtn.addEventListener('click', () => this.selectFolder());

    // Navigation
    this.elements.prevBtn.addEventListener('click', () => this.navigateImage(-1));
    this.elements.nextBtn.addEventListener('click', () => this.navigateImage(1));

    // Transformations
    this.elements.rotateLeftBtn.addEventListener('click', () => this.rotateImage(-90));
    this.elements.rotateRightBtn.addEventListener('click', () => this.rotateImage(90));
    this.elements.flipVerticalBtn.addEventListener('click', () => this.flipImage('vertical'));
    this.elements.flipHorizontalBtn.addEventListener('click', () => this.flipImage('horizontal'));

    // Actions
    this.elements.deleteBtn.addEventListener('click', () => this.deleteImage());

    // Help
    this.elements.closeHelp.addEventListener('click', () => this.hideHelp());

    // Toast close buttons
    document.querySelectorAll('.toast-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.toast').classList.remove('show');
      });
    });

    // Image load events
    this.elements.currentImage.addEventListener('load', () => this.onImageLoad());
    this.elements.currentImage.addEventListener('error', () => this.onImageError());
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if help is open and not escape
      if (!this.elements.helpOverlay.classList.contains('hidden') && e.key !== 'Escape') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateImage(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateImage(1);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.rotateImage(90);
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          this.rotateImage(-90);
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          this.flipImage('vertical');
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          this.flipImage('horizontal');
          break;
        case 'd':
        case 'D':
        case 'Delete':
          e.preventDefault();
          this.deleteImage();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          this.skipImage();
          break;
        case '?':
          e.preventDefault();
          this.toggleHelp();
          break;
        case 'Escape':
          e.preventDefault();
          this.hideHelp();
          break;
      }
    });
  }

  /**
   * Select a folder containing images
   */
  async selectFolder() {
    const startTime = Date.now();
    
    console.log(`📁 FOLDER SELECTION START`);
    
    try {
      this.setOperationStatus('Selecting folder...');
      console.log(`   ⏳ Status: Selecting folder...`);
      
      const result = await window.electronAPI.selectFolder();
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ FOLDER SELECTION SUCCESS`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   📂 Path: ${result.folderPath}`);
        console.log(`   🖼️  Images found: ${result.images.length}`);
        
        this.images = result.images;
        this.currentFolder = result.folderPath;
        this.currentIndex = 0;
        this.resetTransformations();
        
        if (this.images.length > 0) {
          console.log(`   📋 Image list:`, result.images.map(img => img.split('/').pop()));
          console.log(`   🎯 Starting with: ${result.images[0].split('/').pop()}`);
          
          this.showImageViewer();
          await this.loadCurrentImage();
          this.updateUI();
          this.showSuccess(`Loaded ${this.images.length} images from folder`);
          
          console.log(`   ✅ UI updated and first image loaded`);
        } else {
          console.log(`   ⚠️  No supported images found`);
          this.showError('No supported images found in the selected folder');
        }
      } else if (!result.canceled) {
        console.log(`❌ FOLDER SELECTION ERROR`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   🚨 Error: ${result.error || 'Unknown error'}`);
        this.showError(result.error || 'Failed to select folder');
      } else {
        console.log(`🚫 FOLDER SELECTION CANCELED`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   👤 User canceled the dialog`);
      }
      
      this.setOperationStatus('Ready');
      console.log(`   📊 Status: Ready`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ FOLDER SELECTION EXCEPTION`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      this.showError('Failed to select folder');
      this.setOperationStatus('Ready');
    }
  }

  /**
   * Navigate to a different image
   * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
   */
  async navigateImage(direction) {
    if (this.images.length === 0) return;

    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    const actionType = direction === -1 ? 'PREVIOUS' : 'NEXT';
    
    console.log(`🔄 NAVIGATION: ${actionType}`);
    console.log(`   📂 Current: ${currentFileName} (${this.currentIndex + 1}/${this.images.length})`);

    try {
      // Save current transformations if any
      if (this.hasPendingTransformations()) {
        console.log(`   💾 Auto-saving pending transformations before navigation`);
        await this.saveTransformations();
      }

      // Calculate new index
      const newIndex = this.currentIndex + direction;
      
      if (newIndex < 0 || newIndex >= this.images.length) {
        // Handle edge cases
        if (newIndex < 0) {
          console.log(`   ⚠️  Navigation blocked: Already at first image`);
          this.showError('Already at the first image');
        } else {
          console.log(`   ⚠️  Navigation blocked: Already at last image`);
          this.showError('Already at the last image');
        }
        return;
      }

      this.currentIndex = newIndex;
      const newFileName = this.images[this.currentIndex].split('/').pop();
      
      console.log(`   ➡️  Navigating to: ${newFileName} (${this.currentIndex + 1}/${this.images.length})`);
      
      this.resetTransformations();
      await this.loadCurrentImage();
      this.updateUI();
      
      console.log(`✅ NAVIGATION SUCCESS: ${actionType}`);
      console.log(`   📁 Now viewing: ${newFileName}`);
      
    } catch (error) {
      console.error(`❌ NAVIGATION ERROR: ${actionType}`);
      console.error(`   🚨 Error: ${error.message}`);
      this.showError('Failed to navigate to image');
    }
  }

  /**
   * Rotate the current image
   * @param {number} degrees - Degrees to rotate (90 or -90)
   */
  rotateImage(degrees) {
    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    const direction = degrees > 0 ? 'RIGHT' : 'LEFT';
    
    console.log(`🔄 ROTATE ${direction}: ${Math.abs(degrees)}°`);
    console.log(`   📁 File: ${currentFileName}`);
    console.log(`   🔄 Previous rotation: ${this.pendingTransformations.rotation}°`);
    
    this.pendingTransformations.rotation += degrees;
    
    // Normalize rotation to 0-360 range
    this.pendingTransformations.rotation = 
      ((this.pendingTransformations.rotation % 360) + 360) % 360;
    
    console.log(`   ✅ New rotation: ${this.pendingTransformations.rotation}°`);
    console.log(`   🎯 Total pending transformations:`, {
      rotation: this.pendingTransformations.rotation,
      flipVertical: this.pendingTransformations.flipVertical,
      flipHorizontal: this.pendingTransformations.flipHorizontal
    });
    
    this.updateImageTransform();
    this.updateUI();
    
    console.log(`✅ ROTATE ${direction} APPLIED: Visual preview updated`);
  }

  /**
   * Flip the current image
   * @param {string} direction - 'vertical' or 'horizontal'
   */
  flipImage(direction) {
    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    
    console.log(`🔄 FLIP ${direction.toUpperCase()}`);
    console.log(`   📁 File: ${currentFileName}`);
    
    if (direction === 'vertical') {
      const previousState = this.pendingTransformations.flipVertical;
      this.pendingTransformations.flipVertical = !this.pendingTransformations.flipVertical;
      console.log(`   ⇅ Vertical flip: ${previousState} → ${this.pendingTransformations.flipVertical}`);
    } else if (direction === 'horizontal') {
      const previousState = this.pendingTransformations.flipHorizontal;
      this.pendingTransformations.flipHorizontal = !this.pendingTransformations.flipHorizontal;
      console.log(`   ⇄ Horizontal flip: ${previousState} → ${this.pendingTransformations.flipHorizontal}`);
    }
    
    console.log(`   🎯 Total pending transformations:`, {
      rotation: this.pendingTransformations.rotation,
      flipVertical: this.pendingTransformations.flipVertical,
      flipHorizontal: this.pendingTransformations.flipHorizontal
    });
    
    this.updateImageTransform();
    this.updateUI();
    
    console.log(`✅ FLIP ${direction.toUpperCase()} APPLIED: Visual preview updated`);
  }

  /**
   * Skip to next image without saving changes
   */
  async skipImage() {
    if (this.images.length === 0) return;

    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    const hasPendingChanges = this.hasPendingTransformations();
    
    console.log(`⏭️  SKIP ACTION`);
    console.log(`   📁 Current: ${currentFileName} (${this.currentIndex + 1}/${this.images.length})`);
    console.log(`   🔄 Pending changes: ${hasPendingChanges ? 'YES' : 'NO'}`);
    
    if (hasPendingChanges) {
      console.log(`   🗑️  Discarding transformations:`, {
        rotation: this.pendingTransformations.rotation,
        flipVertical: this.pendingTransformations.flipVertical,
        flipHorizontal: this.pendingTransformations.flipHorizontal
      });
    }

    try {
      // Reset transformations without saving
      this.resetTransformations();
      console.log(`   ✅ Transformations discarded`);
      
      // Navigate to next image
      const newIndex = this.currentIndex + 1;
      
      if (newIndex >= this.images.length) {
        console.log(`   ⚠️  Skip blocked: Already at last image`);
        this.showError('Already at the last image');
        return;
      }

      this.currentIndex = newIndex;
      const newFileName = this.images[this.currentIndex].split('/').pop();
      
      console.log(`   ➡️  Skipping to: ${newFileName} (${this.currentIndex + 1}/${this.images.length})`);
      
      await this.loadCurrentImage();
      this.updateUI();
      
      console.log(`✅ SKIP SUCCESS`);
      console.log(`   📁 Now viewing: ${newFileName}`);
      console.log(`   💾 Previous changes: DISCARDED (not saved)`);
      
      this.showSuccess('Skipped to next image');
    } catch (error) {
      console.error(`❌ SKIP ERROR`);
      console.error(`   🚨 Error: ${error.message}`);
      this.showError('Failed to skip image');
    }
  }

  /**
   * Delete the current image file
   */
  async deleteImage() {
    if (this.images.length === 0) return;

    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    const imagePath = this.images[this.currentIndex];
    const startTime = Date.now();
    
    console.log(`🗑️  DELETE ACTION`);
    console.log(`   📁 File: ${currentFileName}`);
    console.log(`   📍 Index: ${this.currentIndex + 1}/${this.images.length}`);
    
    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete "${currentFileName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmed) {
      console.log(`🚫 DELETE CANCELED: User canceled deletion`);
      return;
    }

    try {
      this.setOperationStatus('Deleting image...');
      console.log(`   ⏳ Status: Deleting image...`);
      
      const result = await window.electronAPI.deleteImage(imagePath);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ DELETE SUCCESS: ${currentFileName}`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   🗑️  File deleted from disk`);
        
        // Remove from images array
        this.images.splice(this.currentIndex, 1);
        
        if (this.images.length === 0) {
          console.log(`   📂 No more images in folder`);
          this.showWelcomeScreen();
          this.showSuccess('Image deleted. No more images in folder.');
        } else {
          // Adjust current index if needed
          if (this.currentIndex >= this.images.length) {
            this.currentIndex = this.images.length - 1;
          }
          
          const newFileName = this.images[this.currentIndex].split('/').pop();
          console.log(`   ➡️  Now viewing: ${newFileName} (${this.currentIndex + 1}/${this.images.length})`);
          
          this.resetTransformations();
          await this.loadCurrentImage();
          this.updateUI();
          this.showSuccess(`Image deleted. Now viewing ${newFileName}`);
        }
      } else {
        throw new Error(result.error || 'Failed to delete image');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ DELETE ERROR: ${currentFileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      this.showError('Failed to delete image');
    } finally {
      this.setOperationStatus('Ready');
      console.log(`   📊 Status: Ready`);
    }
  }

  /**
   * Load the current image
   */
  async loadCurrentImage() {
    if (this.images.length === 0) {
      console.log(`📷 LOAD SKIPPED: No images available`);
      return;
    }

    const imagePath = this.images[this.currentIndex];
    const fileName = imagePath.split('/').pop();
    const startTime = Date.now();
    
    console.log(`📷 LOAD START: ${fileName}`);
    console.log(`   📁 Path: ${imagePath}`);
    console.log(`   📍 Index: ${this.currentIndex + 1}/${this.images.length}`);

    try {
      this.showLoading();
      console.log(`   ⏳ Loading indicator shown`);
      
      const result = await window.electronAPI.getImageData(imagePath);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ LOAD SUCCESS: ${fileName}`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   📊 Image info:`, {
          width: result.data.width,
          height: result.data.height,
          format: result.data.format,
          size: `${Math.round(result.data.size / 1024)} KB`
        });
        
        this.elements.currentImage.src = result.data.dataUrl;
        this.updateImageInfo(result.data);
        
        console.log(`   🖼️  Image displayed in UI`);
      } else {
        throw new Error(result.error || 'Failed to load image');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ LOAD ERROR: ${fileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      
      this.showImageError();
      console.log(`   🚫 Error message displayed to user`);
    }
  }

  /**
   * Save current transformations to the image file
   */
  async saveTransformations() {
    if (!this.hasPendingTransformations()) {
      console.log(`💾 SAVE SKIPPED: No pending transformations`);
      return;
    }

    const currentFileName = this.images[this.currentIndex] ? 
      this.images[this.currentIndex].split('/').pop() : 'unknown';
    const startTime = Date.now();
    
    console.log(`💾 SAVE START: ${currentFileName}`);
    console.log(`   📁 File: ${this.images[this.currentIndex]}`);
    console.log(`   🔄 Transformations to save:`, {
      rotation: this.pendingTransformations.rotation,
      flipVertical: this.pendingTransformations.flipVertical,
      flipHorizontal: this.pendingTransformations.flipHorizontal
    });

    try {
      this.setOperationStatus('Saving changes...');
      console.log(`   ⏳ Status: Saving changes...`);
      
      const imagePath = this.images[this.currentIndex];
      const result = await window.electronAPI.transformImage(imagePath, this.pendingTransformations);
      
      const duration = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ SAVE SUCCESS: ${currentFileName}`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        console.log(`   💾 File updated on disk`);
        console.log(`   🎯 Transformations applied permanently`);
        
        this.showSuccess('Changes saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save changes');
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ SAVE ERROR: ${currentFileName}`);
      console.error(`   ⏱️  Duration: ${duration}ms`);
      console.error(`   🚨 Error: ${error.message}`);
      console.error(`   💾 File NOT updated`);
      
      this.showError('Failed to save changes');
    } finally {
      this.setOperationStatus('Ready');
      console.log(`   📊 Status: Ready`);
    }
  }

  /**
   * Update the visual transform of the current image
   */
  updateImageTransform() {
    const { rotation, flipVertical, flipHorizontal } = this.pendingTransformations;
    
    let transform = '';
    
    if (rotation !== 0) {
      transform += `rotate(${rotation}deg) `;
    }
    
    if (flipVertical) {
      transform += 'scaleY(-1) ';
    }
    
    if (flipHorizontal) {
      transform += 'scaleX(-1) ';
    }
    
    this.elements.currentImage.style.transform = transform.trim();
  }

  /**
   * Reset transformations to default state
   */
  resetTransformations() {
    this.pendingTransformations = {
      rotation: 0,
      flipVertical: false,
      flipHorizontal: false
    };
    
    this.elements.currentImage.style.transform = '';
  }

  /**
   * Check if there are pending transformations
   * @returns {boolean}
   */
  hasPendingTransformations() {
    const { rotation, flipVertical, flipHorizontal } = this.pendingTransformations;
    return rotation !== 0 || flipVertical || flipHorizontal;
  }

  /**
   * Update the UI elements
   */
  updateUI() {
    // Update image counter
    if (this.images.length > 0) {
      this.elements.imageCounter.textContent = 
        `${this.currentIndex + 1} of ${this.images.length}`;
    } else {
      this.elements.imageCounter.textContent = 'No images loaded';
    }

    // Update folder path
    this.elements.currentFolder.textContent = this.currentFolder || 'No folder selected';

    // Update pending changes
    if (this.hasPendingTransformations()) {
      const changes = [];
      if (this.pendingTransformations.rotation !== 0) {
        changes.push(`Rotated ${this.pendingTransformations.rotation}°`);
      }
      if (this.pendingTransformations.flipVertical) {
        changes.push('Flipped vertically');
      }
      if (this.pendingTransformations.flipHorizontal) {
        changes.push('Flipped horizontally');
      }
      this.elements.pendingChanges.textContent = changes.join(', ');
    } else {
      this.elements.pendingChanges.textContent = 'No changes';
    }

    // Update button states
    this.elements.prevBtn.disabled = this.currentIndex <= 0;
    this.elements.nextBtn.disabled = this.currentIndex >= this.images.length - 1;
    this.elements.skipBtn.disabled = this.currentIndex >= this.images.length - 1;
  }

  /**
   * Update image information display
   * @param {Object} imageData - Image metadata
   */
  updateImageInfo(imageData) {
    const sizeKB = Math.round(imageData.size / 1024);
    this.elements.imageInfo.textContent = 
      `${imageData.filename} • ${imageData.width}×${imageData.height} • ${sizeKB} KB`;
  }

  /**
   * Show the image viewer screen
   */
  showImageViewer() {
    this.elements.folderSelection.classList.remove('active');
    this.elements.imageViewer.classList.add('active');
  }

  /**
   * Show the folder selection screen
   */
  showFolderSelection() {
    this.elements.imageViewer.classList.remove('active');
    this.elements.folderSelection.classList.add('active');
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.elements.loadingIndicator.classList.remove('hidden');
    this.elements.errorMessage.classList.add('hidden');
    this.elements.currentImage.classList.add('loading');
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.elements.loadingIndicator.classList.add('hidden');
    this.elements.currentImage.classList.remove('loading');
  }

  /**
   * Show image error
   */
  showImageError() {
    this.elements.loadingIndicator.classList.add('hidden');
    this.elements.errorMessage.classList.remove('hidden');
    this.elements.currentImage.classList.remove('loading');
  }

  /**
   * Handle image load success
   */
  onImageLoad() {
    this.hideLoading();
  }

  /**
   * Handle image load error
   */
  onImageError() {
    this.showImageError();
    this.showError('Failed to load image');
  }

  /**
   * Set operation status
   * @param {string} status - Status message
   */
  setOperationStatus(status) {
    this.elements.operationStatus.textContent = status;
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  showError(message) {
    this.showToast(this.elements.errorToast, message);
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.showToast(this.elements.successToast, message);
  }

  /**
   * Show toast notification
   * @param {HTMLElement} toast - Toast element
   * @param {string} message - Message to display
   */
  showToast(toast, message) {
    const messageElement = toast.querySelector('.toast-message');
    messageElement.textContent = message;
    
    toast.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  /**
   * Toggle help overlay
   */
  toggleHelp() {
    this.elements.helpOverlay.classList.toggle('hidden');
  }

  /**
   * Hide help overlay
   */
  hideHelp() {
    this.elements.helpOverlay.classList.add('hidden');
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ImageAdjuster();
});

// Handle any unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
