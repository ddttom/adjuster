import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import ES modules using dynamic import
let imageService;

/**
 * Main application window
 */
let mainWindow;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.resolve(__dirname, '../preload/index.js')
    },
    icon: path.resolve(__dirname, '../public/favicon.ico'),
    show: false
  });

  // Load the renderer HTML file
  mainWindow.loadFile(path.resolve(__dirname, '../renderer/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Initialize the application
 */
async function initialize() {
  try {
    // Dynamically import the image service singleton
    const { default: imageServiceInstance } = await import('../services/image-service.js');
    imageService = imageServiceInstance;
    console.log('Image service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize image service:', error);
    process.exit(1);
  }
}

// App event handlers
app.whenReady().then(async () => {
  await initialize();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Always quit the app when all windows are closed, regardless of platform
  app.quit();
});

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const startTime = Date.now();
  
  console.log('🔌 IPC: select-folder request received');
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Image Folder'
    });
    
    const duration = Date.now() - startTime;
    
    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      console.log('✅ IPC: select-folder success');
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📂 Selected: ${folderPath}`);
      
      return { success: true, folderPath, canceled: false };
    } else {
      console.log('⚠️ IPC: select-folder canceled');
      console.log(`   ⏱️  Duration: ${duration}ms`);
      
      return { success: true, canceled: true };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ IPC: select-folder error');
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('scan-folder', async (event, folderPath) => {
  const startTime = Date.now();
  
  console.log(`🔌 IPC: scan-folder request received`);
  console.log(`   📂 Path: ${folderPath}`);
  
  try {
    const images = await imageService.scanFolder(folderPath);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: scan-folder success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📂 Folder: ${folderPath}`);
    console.log(`   🖼️  Images: ${images.length}`);
    
    return { success: true, folderPath, images };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: scan-folder error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📂 Folder: ${folderPath}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('transform-image', async (event, imagePath, transformations) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: transform-image request received`);
  console.log(`   📁 File: ${fileName}`);
  console.log(`   🔧 Transformations:`, transformations);
  
  try {
    await imageService.applyTransformations(imagePath, transformations);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: transform-image success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    
    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: transform-image error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-image-data', async (event, imagePath) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: get-image-data request received`);
  console.log(`   📁 File: ${fileName}`);
  
  try {
    const imageData = await imageService.getImageData(imagePath);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: get-image-data success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    console.log(`   📊 Size: ${Math.round(imageData.size / 1024)}KB`);
    
    return { success: true, imageData };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: get-image-data error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-image', async (event, imagePath) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: delete-image request received`);
  console.log(`   📁 File: ${fileName}`);
  
  try {
    await imageService.deleteImage(imagePath);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: delete-image success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    
    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: delete-image error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-image-metadata', async (event, imagePath) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: get-image-metadata request received`);
  console.log(`   📁 File: ${fileName}`);
  
  try {
    const metadata = await imageService.getImageMetadata(imagePath);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: get-image-metadata success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    console.log(`   ⭐ Rating: ${metadata.rating || 'none'}`);
    
    return { success: true, metadata };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: get-image-metadata error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-image-rating', async (event, imagePath, rating) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: set-image-rating request received`);
  console.log(`   📁 File: ${fileName}`);
  console.log(`   ⭐ Rating: ${rating}`);
  
  try {
    await imageService.setImageRating(imagePath, rating);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: set-image-rating success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    console.log(`   ⭐ New rating: ${rating}`);
    
    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: set-image-rating error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-rating-from-sidecar', async (event, imagePath) => {
  const startTime = Date.now();
  const fileName = imagePath.split('/').pop();
  
  console.log(`🔌 IPC: get-rating-from-sidecar request received`);
  console.log(`   📁 File: ${fileName}`);
  
  try {
    const rating = await imageService.getRatingFromSidecar(imagePath);
    
    const duration = Date.now() - startTime;
    console.log(`✅ IPC: get-rating-from-sidecar success`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📁 File: ${fileName}`);
    console.log(`   ⭐ Rating: ${rating || 'none'}`);
    
    return { success: true, rating };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: get-rating-from-sidecar error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});
