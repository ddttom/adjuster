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
 * Initialize application services
 */
async function initializeServices() {
  try {
    // Import ES modules
    const imageServiceModule = await import('../services/image-service.js');
    imageService = imageServiceModule.default;

    console.log('Image service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

/**
 * Cleanup application resources
 */
async function cleanup() {
  try {
    console.log('Application cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// App event handlers
app.whenReady().then(async () => {
  await initializeServices();
  createWindow();

  // Handle macOS dock icon click
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', async () => {
  await cleanup();
  
  // Quit the app on all platforms (including macOS) for this desktop application
  app.quit();
});

// Handle app quit
app.on('before-quit', async () => {
  await cleanup();
});

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const startTime = Date.now();
  console.log(`🔌 IPC: select-folder request received`);
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Image Folder'
    });

    const duration = Date.now() - startTime;

    if (!result.canceled && result.filePaths.length > 0) {
      const folderPath = result.filePaths[0];
      console.log(`   📂 Dialog result: ${folderPath}`);
      console.log(`   🔍 Scanning for images...`);
      
      const images = await imageService.scanFolder(folderPath);
      
      console.log(`✅ IPC: select-folder success`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📁 Folder: ${folderPath}`);
      console.log(`   🖼️  Images: ${images.length}`);
      
      return { success: true, folderPath, images };
    }

    console.log(`🚫 IPC: select-folder canceled`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    return { success: false, canceled: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: select-folder error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
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
    console.log(`   📊 Size: ${imageData.width}x${imageData.height}, ${Math.round(imageData.size / 1024)} KB`);
    
    return { success: true, data: imageData };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ IPC: get-image-data error`);
    console.error(`   ⏱️  Duration: ${duration}ms`);
    console.error(`   📁 File: ${fileName}`);
    console.error(`   🚨 Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
